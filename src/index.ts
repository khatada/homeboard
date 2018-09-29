import * as App from "./app";
import * as Web from "./web";

const homeBoard = App.run();
Web.run(homeBoard)
    .catch(error => {
        console.error(error);
    });
