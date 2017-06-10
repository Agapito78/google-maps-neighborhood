/**
 * Created by agapi on 6/2/2017.
 */

APP.Data = (function() {
    function getTopStories(callback) {
        request(HN_TOPSTORIES_URL, function(evt) {
            callback(evt.target.response);
        });
    }

})();
