


import express from 'express';

import {  verifyToken } from '../middleware/authMiddleware';
import { createRole, deleteRole, getAllRoles, getMyAccessibleRoles, updateRole } from '../controllers/roleController';

const router = express.Router();

router.get('/roles', getAllRoles);
router.get('/roles/accessible',verifyToken, getMyAccessibleRoles);
router.post('/roles', verifyToken, createRole);
router.put('/:roleName', verifyToken, updateRole);
router.delete('/:roleName', verifyToken, deleteRole);

export default router;