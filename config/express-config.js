

class ExpressConfig {
    constructor(app) {
        // setting .html as the default template
        app.set('view engin', 'html')

        // Files
        app.use(require('express').static(require('path').join('public')));
    }
}

module.exports = ExpressConfig;