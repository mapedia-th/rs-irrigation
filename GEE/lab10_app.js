/*******************************************************
* 1️⃣ UI: AOI และ Date Input
*******************************************************/
// Map สำหรับวาด AOI
var drawingTools = Map.drawingTools();
drawingTools.setShown(true);
drawingTools.setDrawModes(['polygon','rectangle']);

// Labels
var instructions = ui.Label('1. วาด AOI บนแผนที่\n2. เลือกช่วงวันที่ของภาพ\n3. คลิก Process');
Map.add(instructions);



// Date inputs
var startDate = ui.Textbox({placeholder: 'YYYY-MM-DD', value: '2024-01-01'});
var endDate = ui.Textbox({placeholder: 'YYYY-MM-DD', value: '2024-03-31'});
var panel = ui.Panel({
  widgets: [
    ui.Label('Start Date:'),
    startDate,
    ui.Label('End Date:'),
    endDate
  ],
  style: {position: 'top-left'}
});
Map.add(panel);

// สร้าง Label แสดงข้อความแจ้งเตือน
var message = ui.Label('');
panel.add(message);


/*******************************************************
* 2️⃣ Button เพื่อ process AOI + date range
*******************************************************/
var button = ui.Button('Process', function(){
  
  // ตรวจสอบว่ามี AOI วาดหรือยัง
  var layers = drawingTools.layers();
  if(layers.length() === 0){
    message.setValue('⚠️ กรุณาวาด AOI ก่อน');

    return;
  }
  var aoi = layers.get(0).getEeObject(); // ใช้ layer แรกเป็น AOI

  // โหลดวันที่
  var start = startDate.getValue();
  var end = endDate.getValue();
  
  /*******************************************************
  * โค้ดของแอปพลิเคชั่น
  *******************************************************/
  
  
});

panel.add(button);
