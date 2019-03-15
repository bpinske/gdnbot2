module.exports = {
  name: 'authme',
  usage: '[username]',
  description: `
    Authenticate your SA account

    Examples:
    **!authme LeetLikeJeffK**
    **!authme DickWad Johnson**

    1. Type **!authme SA-Username-Here** to begin (replace **SA-Username-Here** with your actual SA username; spaces are fine too).

    2. Paste your unique hash within the **Additional Information section of your SA profile** (don't forget to save!)

    3. When the hash is in place, return to the bot and type **Praise Lowtax**.

    If you did everything correctly, then you can :getin: (the bot will grant you access to the rest of the server).

    If you didn't, then you can :getout: (start over at Step 1 to try again).
  `,
  execute (message, args) {

  }
};
