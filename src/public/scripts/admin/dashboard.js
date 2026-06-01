// Thêm "active" vào admin-sidebar__list-item dựa vào chỉ số trang
const sidebarListItems = document.querySelectorAll(".admin-sidebar__list-item");
sidebarListItems[0].classList.add("active");

Apex.grid = {
  padding: {
    right: 0,
    left: 0,
  },
};

Apex.dataLabels = {
  enabled: false,
};

var colorPalette = ["#00D8B6", "#008FFB", "#FEB019", "#FF4560", "#775DD0"];

function renderDashboardCharts(chartData) {
  const revenueData = chartData.chartRevenueData || [];
  const categoryData = chartData.chartCategoryData || [];
  const months = revenueData.map((item) => item.month);
  const paid = revenueData.map((item) => Number(item.order_paid));
  const cancel = revenueData.map((item) => Number(item.order_cancel));

  const barOptions = {
    series: [
      {
        name: "Đã thanh toán",
        data: paid,
      },
      {
        name: "Đã hủy",
        data: cancel,
      },
    ],
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: months,
    },
    yaxis: {
      title: {
        text: "Số đơn",
      },
    },
  };

  new ApexCharts(document.querySelector("#bar"), barOptions).render();

  const areaOptions = {
    series: [
      {
        name: "Đã thanh toán",
        data: paid,
      },
      {
        name: "Đã hủy",
        data: cancel,
      },
    ],
    chart: {
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      categories: months,
    },
    legend: {
      position: "top",
    },
    yaxis: {
      title: {
        text: "Số đơn",
      },
    },
  };

  new ApexCharts(document.querySelector("#area"), areaOptions).render();

  const labels = categoryData.map((item) => item.category_name);
  const series = categoryData.map((item) => Number(item.revenue));

  const donutOptions = {
    chart: {
      type: "donut",
      width: "100%",
      height: 400,
    },
    series: series,
    labels: labels,
    colors: colorPalette,
    legend: {
      position: "left",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        customScale: 0.8,
        donut: {
          size: "75%",
        },
        offsetY: 20,
      },
    },
  };

  const donutChart = new ApexCharts(document.querySelector("#donut"), donutOptions);
  donutChart.render();

  function mobileDonut() {
    if ($(window).width() < 768) {
      donutChart.updateOptions(
        {
          plotOptions: {
            pie: {
              offsetY: -15,
            },
          },
          legend: {
            position: "bottom",
          },
        },
        false,
        false,
      );
    } else {
      donutChart.updateOptions(
        {
          plotOptions: {
            pie: {
              offsetY: 20,
            },
          },
          legend: {
            position: "left",
          },
        },
        false,
        false,
      );
    }
  }

  $(window).resize(function () {
    mobileDonut();
  });
}

fetch("/admin/dashboard/getChart")
  .then((res) => res.json())
  .then((res) => {
    if (res.status === "success") {
      renderDashboardCharts(res);
    }
  })
  .catch((error) => {
    console.error("Lỗi tải dữ liệu dashboard:", error);
  });
