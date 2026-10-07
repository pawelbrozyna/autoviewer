import assert from "node:assert/strict";
import { splitVehicleModel } from "./model-title";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

const split = (make: string, model: string) => splitVehicleModel(make, model);

run("Mercedes S-number names show S-Class with the full derivative", () => {
  assert.deepEqual(split("Mercedes-Benz", "S 450 L AMG L N Prem + Exec E A"), {
    model: "S-Class",
    variant: "S 450 L AMG L N Prem + Exec E A",
  });
});

run("short DVSA names keep the base model and move the rest to variant", () => {
  assert.deepEqual(split("Vauxhall", "Combo 2300 Dynamic TD"), {
    model: "Combo",
    variant: "2300 Dynamic TD",
  });
  assert.deepEqual(split("Ford", "Focus 1.0 EcoBoost Titanium"), {
    model: "Focus",
    variant: "1.0 EcoBoost Titanium",
  });
  assert.deepEqual(split("Suzuki", "Swift 1.2 Dualjet SZ5"), {
    model: "Swift",
    variant: "1.2 Dualjet SZ5",
  });
  assert.deepEqual(split("Honda", "CR-V Advance Tech I-MMD CVT"), {
    model: "CR-V",
    variant: "Advance Tech I-MMD CVT",
  });
  assert.deepEqual(split("Volkswagen", "Tiguan Allspace Life TSI S-A"), {
    model: "Tiguan",
    variant: "Allspace Life TSI S-A",
  });
  assert.deepEqual(split("Land Rover", "Range Rover Sport HSE Dynamic"), {
    model: "Range Rover Sport",
    variant: "HSE Dynamic",
  });
});

run("plain model names have no variant", () => {
  assert.deepEqual(split("Ford", "Focus"), { model: "Focus", variant: null });
  assert.deepEqual(split("Volkswagen", "T-ROC"), { model: "T-Roc", variant: null });
  assert.deepEqual(split("ADL", "ENVIRO 400"), { model: "Enviro400", variant: null });
  assert.deepEqual(split("LEVC", "TX"), { model: "TX", variant: null });
});

run("code-style names show the catalogue model and keep the code as variant", () => {
  assert.deepEqual(split("BMW", "320D M Sport"), { model: "3 Series", variant: "320D M Sport" });
  assert.deepEqual(split("Mercedes-Benz", "E 220 D AMG Line"), { model: "E-Class", variant: "E 220 D AMG Line" });
});

run("unknown models only cut at obvious engine, fuel or gearbox words", () => {
  assert.deepEqual(split("Testmake", "Roadster 2.0 Turbo"), { model: "Roadster", variant: "2.0 Turbo" });
  assert.deepEqual(split("Testmake", "Grand Tourer Luxe"), { model: "Grand Tourer Luxe", variant: null });
  assert.deepEqual(split("MG", "ZS EV Trophy Connect"), { model: "ZS EV Trophy Connect", variant: null });
});

run("missing input never produces an empty model", () => {
  assert.deepEqual(split("Ford", ""), { model: "", variant: null });
  assert.deepEqual(splitVehicleModel(null, "Fiesta"), { model: "Fiesta", variant: null });
});
