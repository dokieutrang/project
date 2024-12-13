import express from "express";
import userController from "../controller/userController";
import evenController from "../controller/evenController";
import contactController from "../controller/contactController";
import requestController from "../controller/requestController";

const router = express.Router();

/**
 *
 * @param {*} app : express app
 */
const initApiRouter = (app) => {
  //user
  router.post("/users", userController.createUser);
  router.get("/users", userController.getAllUsers);
  router.put('/users/:id', userController.updateUser);
  router.delete('/users/:id', userController.deleteUser);
  router.post("/login", userController.login);
  router.post("/logOut", userController.logOut);
  router.post("/register", userController.register);
  router.post("/verify-email", userController.verifyEmail);
  router.get("/user-role-organizer", userController.getRoleOrganizer);

  //even
  router.post("/even", evenController.createEven);
  router.get("/even", evenController.getAllEvens);
  router.delete('/even/:id', evenController.deleteEven);
  router.post('/even/:id', evenController.notification);
  router.get("/even-top10", evenController.top10Evens);
  router.get("/even-all", evenController.getAllEvenHomePage);
  router.post("/even-open", evenController.openMeet);

  //contact
  router.post("/contact", contactController.createContact);
  router.get("/contact", contactController.getAllContact);
  router.post("/contact-confirm", contactController.confirmContact);
  router.post("/contact-feedback", contactController.feedback);

  //request
  router.post("/request", requestController.createRequest);
  router.get("/request", requestController.getAllRequestByOrganizerId);
  // router.get("/statistical", requestController.statistical);

  return app.use("/api", router);
};

export default initApiRouter;
