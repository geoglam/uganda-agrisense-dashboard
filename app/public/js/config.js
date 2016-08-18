(function() {
  var config = {
    baseURL:"http://uganda-data.agrisense.org/api/v1/",
    authenticateURL: "http://uganda-data.agrisense.org/api/v1/user",
    mediaURL:"http://uganda-data.agrisense.org/media/agrisense/attachments/",
    token:"yourToken",
    chartFields:{
      chart0:"irrigated",
      chart1:"crop_one_1",
      chart2:[
        {
          text:"Germination",
          field:"select_med"
        },
        {
          text:"Leaf development",
          field:"select_m_1"
        },
        {
          text:"Stem elongation",
          field:"select_m_2"
        },
        {
          text:"Inflorescence",
          field:"select_m_3"
        },
        {
          text:"Flowering",
          field:"select_m_4"
        },
        {
          text:"Development of fruit",
          field:"select_m_5"
        },
        {
          text:"Ripening",
          field:"select_m_6"
        },
      ],
      chart3:"maize_plan",
      chart4:"cost_of__1",
      chart5:"weeded",
      chart6:"farmer_ass",
      chart7:"cost_of_1k",
      chart8:"whole_mato",
      chart9:"cost_of__2",

    }
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = config;
  }else{
    window.appConfig = config;
  }

})();
