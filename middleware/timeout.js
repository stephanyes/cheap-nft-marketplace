
function timeout(req, res, next) {
    // Setting req & res timeout to 1 minute
    req.setTimeout(60000);
    res.setTimeout(60000);
    next();
}

module.exports =  { timeout };