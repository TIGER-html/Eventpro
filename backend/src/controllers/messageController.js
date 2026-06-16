exports.sendMessage = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Message envoyé avec succès"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur envoi message"
    });
  }
};

exports.getMessages = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      messages: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur récupération messages"
    });
  }
};