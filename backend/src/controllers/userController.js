import { User } from '../models/User.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export const listPendingUsers = async (req, res) => {
  const { tenantId } = req.tenant || {};
  const users = await User.find({ tenantId, status: 'INACTIVE' }).select('-password');
  res.json({ message: 'Pending users', data: users });
};

export const approveUser = async (req, res) => {
  const { userId, roles = [] } = req.body;
  const { tenantId } = req.tenant || {};

  if (!userId) throw new ValidationError('userId is required');

  const user = await User.findOne({ _id: userId, tenantId });
  if (!user) throw new NotFoundError('User not found');

  user.status = 'ACTIVE';
  if (roles && roles.length) user.roles = roles;
  await user.save();

  res.json({ message: 'User approved', data: user });
};
