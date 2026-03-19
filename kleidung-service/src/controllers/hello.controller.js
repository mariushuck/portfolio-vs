import { createGreeting } from "../services/hello.service.js";
/**
 * @param {Express.App} app
 */

export default function registerRoutes(app) {
  app.get("/api/hello/:name", sayHello);
}

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */

function sayHello(req, res) {
  let result = {
    message: createGreeting(req.params.name),
  };

  res.status(200);
  res.send(result);
}
