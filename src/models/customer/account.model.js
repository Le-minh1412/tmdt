const db = require("../../config/db/connect");
const util = require("node:util");
const jwt = require("jsonwebtoken");
const query = util.promisify(db.query).bind(db);
const general = require("../general.model");
const index = require("./index.model");

const account = function () {};

account.updateInfo = async (req, res) => {
  const updateInfo = `
        UPDATE users 
        SET 
            user_login_name = ?,
            user_name = ?,
            user_birth = ?,
            user_sex = ?,
            user_email = ?,
            user_phone = ?,
            user_address = ?
        WHERE user_id = ?
    `;

  const values = [
    req.body.user_phone,
    req.body.user_name,
    // new Date(req.body.user_birth),
    req.body.user_birth,
    req.body.user_sex,
    req.body.user_email,
    req.body.user_phone,
    req.body.user_address,
    req.user.user_id,
  ];

  const result = await query(updateInfo, values);
};

account.checkPassword = async (req, callback) => {
  const user_password = req.body.user_password;
  const user_id = req.user.user_id;

  db.query("SELECT *  FROM users WHERE user_id = ?", [user_id], async (err, result) => {
    if (err) callback(1, 0, 0);
    if (!(await bcrypt.compare(user_password, result[0].user_password))) {
      callback(0, 1, 0);
    } else {
      callback(0, 0, 1);
    }
  });
};

account.getPurchaseHistory = async (customer_id, order_status, order_id) => {
  if (!customer_id) return [];

  let getPurchaseHistorys = `SELECT * 
                                FROM view_orders
                                WHERE customer_id = ?`;
  let params = [customer_id];

  if (order_id) {
    getPurchaseHistorys += ` AND order_id = ?`;
    params.push(order_id);
  }
  if (order_status) {
    getPurchaseHistorys += ` AND order_status = ?`;
    params.push(order_status);
  }

  getPurchaseHistorys += ` ORDER BY order_date DESC, order_id DESC`;

  let purchaseHistorys = await query(getPurchaseHistorys, params);

  return new Promise(async (resolve, reject) => {
    const promises = [];
    purchaseHistorys.forEach(async (purchaseHistory) => {
      promises.push(
        account.getDetailPurchaseHistorys(purchaseHistory.order_id, customer_id).then((order_details) => {
          purchaseHistory.order_details = order_details;
        }),
      );
    });
    await Promise.all(promises);
    resolve(purchaseHistorys);
  });
};

account.getDetailPurchaseHistorys = async (order_id, customer_id) => {
  let getDetailPurchaseHistorys = `SELECT * FROM view_order_detail WHERE order_id = ?`;
  let detailPurchaseHistorys = await query(getDetailPurchaseHistorys, [order_id]);

  return new Promise(async (resolve, reject) => {
    const promises = [];
    detailPurchaseHistorys.forEach(async (detailPurchaseHistory) => {
      promises.push(
        account.viewFeedback(customer_id, detailPurchaseHistory.order_id, detailPurchaseHistory.product_variant_id).then((feedback) => {
          detailPurchaseHistory.feedback = feedback;
        }),
      );
    });
    await Promise.all(promises);
    resolve(detailPurchaseHistorys);
  });
};

account.insertFeedback = async (product_variant_id, customer_id, order_id, feedback_rate, feedback_content, callback) => {
  // Validate inputs
  if (!product_variant_id || !customer_id || !order_id) {
    console.error("Missing required fields:", { product_variant_id, customer_id, order_id });
    return callback(1, 0);
  }

  if (feedback_content == "") feedback_content = "Bạn không để lại lời nhận xét nào";

  // Use parameterized query to prevent SQL injection and ensure proper data types
  let insertFeedback = `INSERT INTO feedbacks (product_variant_id, customer_id, order_id, feedback_rate, feedback_content, feedback_is_display) VALUES (?, ?, ?, ?, ?, 1)`;

  db.query(insertFeedback, [product_variant_id, customer_id, order_id, feedback_rate, feedback_content], (err, result) => {
    if (err) {
      console.log("Error inserting feedback:", err);
      callback(1, 0);
    } else {
      console.log("Feedback inserted successfully for product_variant_id:", product_variant_id);
      // Return feedback_id for inserting images
      callback(0, result.insertId);
    }
  });
};

account.insertFeedbackImg = async (feedback_id, feedback_img_name, callback) => {
  if (!feedback_id || !feedback_img_name) {
    return callback(1, 0);
  }

  let insertImg = `INSERT INTO feedback_imgs (feedback_id, feedback_img_name, feedback_img_is_display) VALUES (?, ?, 1)`;

  db.query(insertImg, [feedback_id, feedback_img_name], (err, result) => {
    if (err) {
      console.log("Error inserting feedback image:", err);
      callback(1, 0);
    } else {
      console.log("Feedback image inserted successfully for feedback_id:", feedback_id);
      callback(0, 1);
    }
  });
};

account.viewFeedback = async (customer_id, order_id, product_variant_id) => {
  let viewFeedback = `SELECT f.*, GROUP_CONCAT(fi.feedback_img_name) as feedback_img_names
                      FROM feedbacks f
                      LEFT JOIN feedback_imgs fi ON f.feedback_id = fi.feedback_id AND fi.feedback_img_is_display = 1
                      WHERE f.customer_id = ? AND f.order_id = ? AND f.product_variant_id = ?
                      GROUP BY f.feedback_id`;
  let feedback = await query(viewFeedback, [customer_id, order_id, product_variant_id]);

  if (!feedback[0]) {
    return 0;
  } else {
    // Parse image names into array
    if (feedback[0].feedback_img_names) {
      feedback[0].feedback_imgs = feedback[0].feedback_img_names.split(",");
    } else {
      feedback[0].feedback_imgs = [];
    }
    return feedback[0];
  }
};

module.exports = account;
