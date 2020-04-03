import _ from 'lodash';
import {Http} from '../../services';
import request from 'superagent';

export default  {
    bucketConfig: null,

    generateUpToken(prefix, callback) {
        Http.get(`/oss/upToken`, {prefix: prefix.type||''}).then(res=>{
            callback(res)
        });
    },

    uploadImageToAliyun(file, token, onProgress, onSuccess, onError) {
        let formData = new FormData();
        formData.append('key', token.prefix+file.uid+'/'+file.name);
        formData.append('policy', token.policy);
        formData.append('OSSAccessKeyId', token.accessId);
        formData.append('success_action_status', '200');
        formData.append('callback', token.callback);
        formData.append('signature', token.signature);
        formData.append('file', file);
        request
            .post(token.host)
            .on("progress", function(evt) {
                if (evt.lengthComputable && _.isFunction(onProgress)) {
                    onProgress(evt.loaded*100 / evt.total);
                }
            }, false)
            .send(formData)
            .end((err, res)=> {
                if(err){
                    onError(err);
                }else{
                    var id=_.get(res, 'body.id')
                    Http.post("/oss/get",{ids:id}).then((res)=>{
                        var data={
                            data:_.get(res, 'data.content'),
                            id:id
                        }
                        onSuccess(data);
                    })
                }
            });
    },

    getFileBase64(file, callback) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            callback(reader.result);
        };
        reader.onerror = function (error) {
        };
    },

};

