define(['oxjs', 'mustache', 'oxm/wurui/image-uploader/0.2.3/asset/main'], function(OXJS, Mustache, Uploader) {
    var regMobileNo = /^1\d{10}$/;
    var tpl_imgfile = '<span id="{{id}}" class="imgpreview" style="background-image:url({{src}});"><b class="J_Del btn-x">&times;</b></span>';
    var checkform = function(f) {
        var els = f.elements,
            el, i = 0;
        while (el = els[i++]) {
            if (el.name && el.getAttribute('required') && !el.value) {
                return el;
            }
        }
    }
    return {
        init: function($mod) {
            var uploaders = {},
               // ds_id = $mod.attr('data-dsid'),
                uploaderConf = {
                    oxm: $mod.attr('ox-mod'),
                    uid: $mod.attr('data-uid'),
                   // ds_id: ds_id
                },
                openxslHost = 'https://www.openxsl.com';
            if (document.documentElement.getAttribute('env') == 'local') {
                openxslHost = 'http://local.openxsl.com'
            }
            var restSMS=OXJS.useREST('sms').setDevHost('http://dev.openxsl.com/');


            //图片压缩+上传
            $mod.on('change', function(e) {

                var tar = e.target;
                switch (true) {
                    case tar.type == 'file':
                        var name = tar.getAttribute('data-name');
                        var uploader = uploaders[name];
                        if (!uploader) {
                            uploader = uploaders[name] = new Uploader(uploaderConf)
                            uploaders[name].onUploadProgress = function() {
                                $(tar).parent().children('.imgpreview:not(.upload-done)').eq(0).addClass('upload-done')
                            }
                        }
                        var file_id = tar.id;
                        uploader.addToQ(tar.files, function(arr) {
                            for (var i = 0; i < arr.length; i++) {
                                $('label[for=' + file_id + ']').before(Mustache.render(tpl_imgfile, {
                                    id: arr[i]._id,
                                    src: arr[i]._data
                                }));
                            }
                        });
                        break
                    case tar.name == 'phone_no_v':
                        if (regMobileNo.test(tar.value) && !tar.__hasvcode) {
                            tar.__hasvcode = true;
                            var $li = $(tar).closest('li');
                            $li.after('<li class="type-vcode"><input type="tel" required="required" placeholder="验证码" name="sms_vcode"/><input data-role="sendvcode" class="J_sendvcode" type="button" value="发送验证码"/></li>')
                        }
                        break
                }


            });
            $mod.on('click', '.J_Del', function(e) {
                var span = e.target.parentNode,
                    name = span.parentNode.getAttribute('data-name');
                var uploader = uploaders[name];
                uploader.delFromQ(span.id);
                $(span).remove();
            });
            $mod.on('click', '.J_sendvcode', function(e) {
                var f = $('form', $mod)[0];
                var phoneNo = f.phone_no_v.value;
                if (!regMobileNo.test(phoneNo)) {
                    return alert('手机号码不正确')
                }
                var activecode = (f.activecode && f.activecode.value) || '';

                //TODO: 改成新的通知接口
                var apiHost = 'https://www.shaomachetie.com';
                if (document.documentElement.getAttribute('env') == 'local') {
                    apiHost = 'http://192.168.1.103:8000'
                }
                restSMS.get({target:phoneNo,smsconfig:'vcode'})
                /*
                $.getJSON(apiHost + '/carnotify/sendsms_vcode?_id=' + f._id.value + '&target=' + phoneNo + '&activecode=' + activecode + '&callback=?', function(r) {

                });*/
                var btn = this,
                    downcounter = 119,
                    originValue = btn.value;
                btn.disabled = true;

                btn.value = '重新发送(' + downcounter + 's)';

                var IV = setInterval(function() {
                    downcounter--;
                    btn.value = '重新发送(' + downcounter + 's)'
                    if (downcounter == 0) {
                        clearInterval(IV);
                        btn.value = originValue
                        btn.disabled = false
                    }
                }, 1000)
            });
            var batchUpload = function(fn) {
                var data = {},
                    len = Object.keys(uploaders).length;
                if (len) {
                    for (var k in uploaders) {

                        uploaders[k].startUpload(function(e, r) {
                            data[k] = r.urls;
                            len--
                            if (!len) {
                                fn(data);
                            }
                        });
                    }
                } else {
                    fn();
                }

            }
            $('.J_submit', $mod).on('click', function() {
                var $f = $('form', $mod),
                    f = $f[0],
                    err_el = checkform(f);
                if (err_el) {
                    $(err_el).addClass('error').one('change', function() {
                        $(this).removeClass('error')
                    });

                    alert('表单填写不完整');
                    err_el.focus()
                    return false;
                }

                this.disabled = true;
                this.innerHTML = '提交中,请稍候...'
                $mod.addClass('before-submitting')
                var btn = this;

                batchUpload(function(files) {
                    var ajax = !!$f.attr('data-ajax'),
                        forwardurl = $mod.attr('data-forwardurl');
                    //var data=OXJS.formToJSON(f);


                    if (files) {
                        for (var k in files) {
                            f[k].value = files[k].toString()
                        }
                    }
                    $mod.removeClass('before-submitting').addClass('submitting');


                    if (!ajax) {
                        f.submit();
                    } else {
                        $.ajax({
                            url: f.action,
                            type: f.getAttribute('method'),//f.method 如果是put，则变成get
                            data: OXJS.formToJSON(f),
                            dataType: 'json',
                            success: function(r) {
                                if (r && r.code==0) {
                                    forwardurl && (location.href = forwardurl);
                                    
                                } else {
                                    btn.disabled = false;
                                    btn.innerHTML = '提交'
                                    $mod.removeClass('submitting')
                                    alert(r && r.message||'Unknown Error')
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