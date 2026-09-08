import { handleSaveRequest } from '../../../services/save-service.mjs';

export function onRequest({ request, env, params }) {
  return handleSaveRequest(request, env.SAVES, params.key);
}
