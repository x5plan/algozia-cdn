const fs = require("fs");
const src = "assets/";
const dist = "dist/assets/";

(function () {
    if (fs.existsSync(dist)) {
        fs.rmSync(dist, { recursive: true, force: true });
        fs.mkdirSync(dist);
    } else {
        fs.mkdirSync(dist, { recursive: true });
    }

    fs.cpSync(src, dist, { recursive: true });
})();
