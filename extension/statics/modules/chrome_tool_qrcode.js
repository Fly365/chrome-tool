// 二维码工具
layui.define(['chromeTool', 'jquery', 'chromeToolBase', 'element'], function (exports) {
    var $ = layui.$;

    var chrome_tool_qrcode = function (tool_id) {
        var tool = new layui.chromeToolBase(tool_id);
        tool.getPageData = function (flag, key) {
            var string = layui.chromeTool.clipboardPaste();
            return tool.pageData(flag).get(key, function () {
                if (flag == 'generate') {
                    return {"generate_input_content": string};
                }
                if (flag == 'tab') {
                    return {"class_tab0": 'layui-this', 'class_div0': 'layui-show'};
                }
                return null;
            });
        };
        tool.loadComplete = function () {
            var id = this.getBlockId();
            layui.element.on('tab(url)', function (data) {
                var tpl_data = {};
                tpl_data['class_tab' + data.index] = 'layui-this';
                tpl_data['class_div' + data.index] = 'layui-show';
                tool.pageData('tab').set(tpl_data);
            });
            var generate = $("#" + id + " .generate_tab");

            // 网址二维码生成
            generate.find(".submit_button").on("click", function () {
                var data = {
                    "input_content": generate.find('.input_content').val(),
                    "output_content": ""
                };
                layui.use(['chrome_tool_library_qrcode'], function () {
                    generate.find(".output_content").html('');
                    layui.chrome_tool_library_qrcode.generate(generate.find(".output_content")[0],data.input_content);
                    setTimeout(function(){
                        data.output_content = generate.find(".output_content").html();
                        tool.pageData('generate').set(data);
                    },2000)
                });
            });
            var decoder = $("#" + id + " .decoder_tab");
            // 解码方法
            var qrcode_decoder = function(src,callback){
                var input_img = '<img src="'+src+'" style="width: 320px;">';
                decoder.find('.input_img').html(input_img);
                layui.use(['chrome_tool_library_qrcode'], function () {
                    layui.chrome_tool_library_qrcode.decoder(decoder.find('.input_img img').attr('src'),function(data){
                        if(data=="error decoding QR Code"){
                            layui.chromeTool.msg("该图片无法识别");
                            return null;
                        }
                        callback(data,input_img);
                    });

                });
            }
            // 网址二维码解码
            decoder.find(".submit_button").on("click", function () {
                if(!decoder.find('.input_content').val())
                {
                    layui.chromeTool.msg("填写图片地址以后再点击解析按钮");
                    return null;
                }
                var data = {
                    "input_content":decoder.find('.input_content').val()
                };
                qrcode_decoder(data.input_content,function(result,input_img){
                    data.input_img = input_img;
                    data.output_content = result;
                    decoder.find(".output_content").val(data.output_content);
                    tool.pageData('decoder').set(data);
                    // 复制结果
                    layui.chromeTool.resultAutoCopy(data.output_content);
                });
            });
            // 图片上传解码
            decoder.find(".file_qrcode").change(function(){
                var reader = new FileReader();
                reader.readAsDataURL($(this)[0].files[0]);
                reader.onload = function(e){
                    qrcode_decoder(e.target.result,function(result,input_img){
                        var data = {};
                        data.input_img = input_img;
                        data.output_content = result;
                        decoder.find(".output_content").val(data.output_content);
                        tool.pageData('decoder').set(data);
                        // 复制结果
                        layui.chromeTool.resultAutoCopy(data.output_content);
                    });
                };
            });
            // 上传二维码按钮
            decoder.find(".file_button").on("click", function () {
                decoder.find(".file_qrcode").click();
            });
        };
        return tool;
    };
    exports('chrome_tool_qrcode', chrome_tool_qrcode);
});