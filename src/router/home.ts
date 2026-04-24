import  express from 'express';
import { homePage } from '../controllers/home';
export default  (router: express.Router) => {

router.get("/", homePage)
}