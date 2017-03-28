define(['oxjs', 'mustache', 'oxm/wurui/image-uploader/0.0.3/asset/main'], function (OXJS, Mustache, Uploader) {
    var tpl_imgfile = '<span id="{{id}}" class="imgpreview" style="background-image:url({{src}});"><b class="J_Del btn-x">&times;</b></span>'
    return {
        init: function ($mod) {
            var uploaders = {};
            var uploaderConf = {
                sid: '2JOWSNPZMIYYV24GGI0YX13L',
                oxm: $mod.attr('ox-mod')
            };
            $.post('/login/templogin',{selector:"{}"},function(r){

                uploaderConf.sid=r && r.data && r.data.sid
            });

//图片压缩+上传
            $mod.on('change', function (e) {

                var tar = e.target;

                if (tar.type == 'file') {
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

                }
            });
            $mod.on('click', '.J_Del', function (e) {
                var span = e.target.parentNode,
                    name = span.parentNode.getAttribute('data-name');
                var uploader = uploaders[name];
                uploader.delFromQ(span.id);
                $(span).remove();
            });
            var batchUpload = function (fn) {
                var data = {},
                    len = Object.keys(uploaders).length;
                for (var k in uploaders) {

                    uploaders[k].startUpload(function (e, r) {
                        data[k] = r.urls;
                        len--
                        if (!len) {
                            fn(data);
                        }
                    });
                }
            }
            $('.J_submit', $mod).on('click', function () {
                batchUpload(function (files) {
                    var $f = $('form', $mod),
                        f = $f[0],
                        ajax = !!$f.attr('data-ajax'),
                        forwardurl=$mod.attr('data-forwardurl');
                    //var data=OXJS.formToJSON(f);

                    for (var k in files) {
                        f[k].value = files[k].toString()
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