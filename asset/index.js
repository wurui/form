define(['oxjs', 'mustache', 'oxm/wurui/image-uploader/0.0.4/asset/main'], function (OXJS, Mustache, Uploader) {
    var regMobileNo=/^1\d{10}$/ ;
    var tpl_imgfile = '<span id="{{id}}" class="imgpreview" style="background-image:url({{src}});"><b class="J_Del btn-x">&times;</b></span>'
    return {
        init: function ($mod) {
            var uploaders = {};
            var uploaderConf = {
                sid: '2JOWSNPZMIYYV24GGI0YX13L',
                oxm: $mod.attr('ox-mod')
            };

            $.ajax({
                url:'https://www.openxsl.com/login/templogin',
                data:{selector:"{}"},
                dataType:'json',
                type:'post',
                success:function(r){
                    if(r.error) {
                        alert(r.error)
                    }else{
                        uploaderConf.sid = r && r.data && r.data.sid
                    }

                }
            })

//图片压缩+上传
            $mod.on('change', function (e) {

                var tar = e.target;
                switch (true){
                    case tar.type == 'file':
                        var name = tar.getAttribute('data-name');
                        var uploader = uploaders[name];
                        if (!uploader) {
                            uploader = uploaders[name] = new Uploader(uploaderConf)
                        }
                        var file_id = tar.id;
                        uploader.addToQ(tar.files, function (arr) {
                            for (var i = 0; i < arr.length; i++) {
                                $('label[for=' + file_id + ']').before(Mustache.render(tpl_imgfile, {
                                    id: arr[i]._id,
                                    src: arr[i]._data
                                }));
                            }
                        });
                        break
                    case tar.name=='phone_no_v':
                        if(regMobileNo.test(tar.value) && !tar.__hasvcode){
                            tar.__hasvcode=true;
                            var $li=$(tar).closest('li');
                            $li.after('<li class="type-vcode"><input type="tel" required="required" placeholder="验证码" name="sms_vcode"/><input data-role="sendvcode" class="J_sendvcode" type="button" value="发送验证码"/></li>')
                        }
                        break
                }


            });
            $mod.on('click', '.J_Del', function (e) {
                var span = e.target.parentNode,
                    name = span.parentNode.getAttribute('data-name');
                var uploader = uploaders[name];
                uploader.delFromQ(span.id);
                $(span).remove();
            });
            $mod.on('click','.J_sendvcode',function(e){
                var f = $('form', $mod)[0];
                var phoneNo= f.phone_no_v.value;
                if(!regMobileNo.test(phoneNo)){
                    return alert('手机号码不正确')
                }
                var activecode= (f.activecode && f.activecode.value)||'';
                var apiHost = 'http://www.shaomachetie.com';
                if(document.documentElement.getAttribute('env')=='local') {
                    apiHost = 'http://192.168.1.103:8000'
                }
                $.getJSON(apiHost+'/carnotify/sendsms_vcode?_id='+ f._id.value+'&target='+phoneNo+'&activecode='+activecode+'&callback=?',function(r){

                });
                var btn=this,
                    downcounter=59,
                    originValue=btn.value;
                btn.disabled=true;

                btn.value='重新发送('+downcounter+'s)';

                var IV=setInterval(function(){
                    downcounter--;
                    btn.value='重新发送('+downcounter+'s)'
                    if(downcounter==0){
                        clearInterval(IV);
                        btn.value=originValue
                        btn.disabled=false
                    }
                },1000)
            });
            var batchUpload = function (fn) {
                var data = {},
                    len = Object.keys(uploaders).length;
                if(len){
                    for (var k in uploaders) {

                        uploaders[k].startUpload(function (e, r) {
                            data[k] = r.urls;
                            len--
                            if (!len) {
                                fn(data);
                            }
                        });
                    }
                }else{
                    fn();
                }

            }
            $('.J_submit', $mod).on('click', function () {
                batchUpload(function (files) {
                    var $f = $('form', $mod),
                        f = $f[0],
                        ajax = !!$f.attr('data-ajax'),
                        forwardurl=$mod.attr('data-forwardurl');
                    //var data=OXJS.formToJSON(f);

                    if(files){
                        for (var k in files) {
                            f[k].value = files[k].toString()
                        }
                    }


                    if (!ajax) {
                        f.submit();
                    } else {
                        $.ajax({
                            url: f.action,
                            type: f.method,
                            dataType: 'json',
                            success: function (r) {
                                if (r.error) {
                                    alert(r.error)
                                } else {
                                    forwardurl && (location.href=forwardurl);
                                }
                            }
                        })
                    }


                });

                return false;
            })
        }
    }
})