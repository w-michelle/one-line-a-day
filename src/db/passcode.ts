import mongoose from "mongoose";

const PasscodeSchema = new mongoose.Schema({
  authentication: {
    passcode: { type: String, required: true, select: false },
    salt: { type: String, required: true, select: false },
  },
});

export const PasscodeModel = mongoose.model("Passcode", PasscodeSchema);

export const createPasscode = (values: Record<string, any>) =>
  new PasscodeModel(values).save().then((key) => key.toObject());

export const getPasscode = () => PasscodeModel.findOne();
