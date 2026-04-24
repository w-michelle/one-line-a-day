import express from "express"

export const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    //if theres no user, send them to login
    if(!res.locals.currentUser) {
        return res.redirect("/login")
    }

    //if there is user allow access by going to the next which is ex.createPost
    return next()
}