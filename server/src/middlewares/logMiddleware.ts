import { NextFunction, Request, Response } from "express";

const getTimeTaken = (duration: number) => {
    let durationText;
    if (duration > 60000) {
        const mins = Math.floor(duration / 60000);
        const secs = Math.floor((duration % 60000) / 1000);
        durationText = secs > 0 ? `${mins} min ${secs} s` : `${mins} min`;
    } else if (duration > 1000) {
        durationText = `${(duration / 1000).toFixed(2)} s`;
    } else {
        durationText = `${duration} ms`;
    }
    return durationText;
};

export const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Listen for the finish event on response to capture status code and timing
    res.on("finish", () => {
        const duration = Date.now() - start;
        const urlWithoutQuery = req.originalUrl.split("?")[0];
        const durationText = getTimeTaken(duration);

        // use durationText in the log message instead of raw duration
        const logMessage = `${req.method} ${urlWithoutQuery} ${res.statusCode} - ${durationText}`;

        if (res.statusCode === 200) {
            console.info(logMessage);
        } else {
            console.error(logMessage);
        }
    });

    next();
};