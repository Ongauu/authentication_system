
const createRefreshToken = async ({ token, userId, expiresAt }) => {
  return prisma.refreshToken.create({ data: { token, userId, expiresAt } });
};

const findRefreshToken = async (token) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
};


const deleteRefreshToken = async (token) => {
  
  return prisma.refreshToken.deleteMany({ where: { token } });
};


const deleteAllRefreshTokensForUser = async (userId) => {
  return prisma.refreshToken.deleteMany({ where: { userId } });
};


const createPasswordResetToken = async ({ tokenHash, userId, expiresAt }) => {
  return prisma.passwordResetToken.create({
    data: { tokenHash, userId, expiresAt },
  });
};


const findPasswordResetToken = async (tokenHash) => {
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
};


const markPasswordResetTokenUsed = async (tokenHash) => {
  return prisma.passwordResetToken.update({
    where: { tokenHash },
    data: { used: true },
  });
};


const deletePasswordResetTokensForUser = async (userId) => {
  return prisma.passwordResetToken.deleteMany({
    where: { userId, used: false },
  });
};

module.exports = {
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllRefreshTokensForUser,
  createPasswordResetToken,
  findPasswordResetToken,
  markPasswordResetTokenUsed,
  deletePasswordResetTokensForUser,
};
