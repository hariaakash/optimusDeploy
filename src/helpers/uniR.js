module.exports = (res, status, msg) => {
    res.json({
        status,
        msg
    });
};