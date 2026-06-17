
const prisma = require('../config/database');

const createUser = async ({ name, email, password }) => {
  return prisma.user.create({
    data: { name, email, password },
    select: { id: true, name: true, email: true, createdAt: true },
  });
};

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } });
};

const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });
};


const updatePassword = async (userId, hashedPassword) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

module.exports = { createUser, findUserByEmail, findUserById, updatePassword };
