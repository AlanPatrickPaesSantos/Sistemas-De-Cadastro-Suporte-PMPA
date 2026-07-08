const bloquearVisualizador = (req, res, next) => {
  if (req.user && req.user.papel === 'visualizador' && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(403).json({ error: 'Acesso negado: Perfil visualizador não possui permissão de escrita/alteração.' });
  }
  next();
};

const permitirPerfis = (...perfis) => {
  return (req, res, next) => {
    if (req.user && perfis.includes(req.user.papel)) {
      next();
    } else {
      res.status(403).json({ error: 'Acesso negado: Nível de acesso insuficiente.' });
    }
  };
};

module.exports = {
  bloquearVisualizador,
  permitirPerfis
};
