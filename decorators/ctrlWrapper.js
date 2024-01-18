const ctrlWrapper = (ctrl) => {
  const func = async (req, res, next) => {
    try {
      const result = await ctrl(req, res, next);
      res.sendStatus(200);
      // return res.status(200);
    } catch (error) {
    //   console.log(error);  
      next(error);
    }
  };
  return func;
};

module.exports = ctrlWrapper;
