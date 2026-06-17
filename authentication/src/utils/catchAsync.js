// for not need to write try catch at every route function


const catchAsync = (fn) => {
  return (req, res, next) => {
    
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
