var knex = require("../database/connection");
var User = require("./User");

class PasswordToken {
  async create(email) {
    var user = await User.findByEmail(email);
    if (user != undefined) {
      try {
        var token = Date.now();
        await knex
          .insert({
            user_id: user.id,
            used: 0,
            token: token,
          })
          .table("passwordtokens");

        return { status: true, token: token };
      } catch (err) {
        console.log(err);
        return { status: false, err: err };
      }
    } else {
      return { status: false, err: "O email passado não existe no bd" };
    }
  }

  async validate(token) {
    try {
      var result = await knex
        .select()
        .where({ token: token })
        .table("passwordtokens");

      if (result.length > 0) {
        var tk = result[0];

        if (tk.used) {
          return { status: false };
        } else {
          return { status: true, token: tk };
        }
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async changePassword(req, res) {
    var token = req.body.token;
    var password = req.body.password;

    var isTokenValid = PasswordToken.validate(token);

    if (isTokenValid) {
    } else {
      res.status(406);
      res.send("Token invalido");
    }
  }
}

module.exports = new PasswordToken();
