var _ = require("lodash");


function getMiddleware(application) {
  var middlewareCollection = [];
  for (var i = 0; i < application.stack.length; i++) {
    var middleware = application.stack[i];
    middlewareCollection.push({
      route: middleware.route,
      handlerName: middleware.handle.name
    });
  }
  return middlewareCollection;
}

function getRoutes(application) {
  return application.routes;
}

function getRouter(application) {
  return application._router;
}

function getSettings(application) {
  return application.settings;
}

function getRelevantReqParams(req) {
  return {
    params: req.params,
    query: req.query,
    body: req.body
  }
}

function startServer(application, port) {
  var io = require('socket.io').listen(port);
  return io;

}



module.exports = function expressor(application, options) {
  var defaults = {
    port: 3349
  };
  var options = _.extend(options || {}, defaults),
      requests = [];

  if(!application.handle) throw "you must supply an application";

  var io = startServer(application, options.port);
  io.sockets.on('connection', function (socket) {
    io.sockets.emit('this', { will: 'be received by everyone' });

    socket.on('private message', function (from, msg) {
      console.log('I received a private message by ', from, ' saying ', msg);
    });

    socket.on('disconnect', function () {
      io.sockets.emit('user disconnected');
    });
  });
  return function expressor(req, res, next) {
    requests.push(getRelevantReqParams(req));
    console.dir(application);
    switch(req.path) {
      case '/expressor/requests':
        res.json(getMiddleware(application));
        break;
      case '/expressor/middleware':
        res.json(getMiddleware(application));
        break;
      case '/expressor/routes':
        res.json(getRoutes(application));
        break;
      case '/expressor/router':
        res.json(getRouter(application));
        break;
      case '/expressor/settings':
        res.json(getSettings(application));
        break;
      default:
        next();
    }
  };
};
