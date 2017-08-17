var utils = require('./utils');

var TalkService = {
  getOffers: function() {
    return utils.get('/api/talk/inbox?thread_options[listing]=true&thread_options[size]=2');
  },
  getOffer: function(thread_id, includeListing) {
  	var api_url = '/api/talk/inbox/' + thread_id;
  	if(includeListing){
  		api_url += '?listing=true';
  	}
    return utils.get(api_url);
  },
  sendToThread: function(thread_id, messageType, data){
    return utils.post('/api/talk/inbox/' + thread_id + '/send/' + messageType, data);
  },
};

module.exports = TalkService;
