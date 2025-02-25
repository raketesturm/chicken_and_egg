/* Copyright 2014 (c) SoFIE Studios.  All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file.
 */

/**
 * @fileoverview Unit tests for the Farmer object.
 */
module("Farmer Object", {
  teardown: function() {
    equal(NotificationDefaultCenter().hasObserversForNotification(
        Farmer.FARMER_DID_DIE_NOTIFICATION), false);
  }
});

test("Default Constructor", function() {
  var testFarmer = new Farmer();
  equal(testFarmer.health(), 1);
});

test("Is Alive", function() {
  var testFarmer = new Farmer();
  ok(testFarmer.isAlive());
  testFarmer.setHealth(0);
  equal(testFarmer.isAlive(), false);
});

test("Eat Egg", function() {
  var testFarmer = new Farmer();
  var health = testFarmer.health();
  testFarmer.setHealth(health / 3);
  ok(testFarmer.isAlive());
  ok(testFarmer.health() < health);
  health = testFarmer.health();
  equal(testFarmer.eatEggs(1), 1);
  ok(testFarmer.health() > health);
});

test("Eat Too Many Eggs", function() {
  var testFarmer = new Farmer();
  var health = testFarmer.health();
  testFarmer.setHealth(health - 3 * Farmer.EGG_STRENGTH);
  ok(testFarmer.isAlive());
  ok(testFarmer.health() < health);
  health = testFarmer.health();
  equal(testFarmer.eatEggs(Farmer.MAX_EGG_EAT_COUNT + 2), Farmer.MAX_EGG_EAT_COUNT);
  ok(testFarmer.health() > health);
});

test("Try Eating Above 50% Health", function() {
  var testFarmer = new Farmer();
  testFarmer.setHealth(Farmer.HUNGER_LEVEL + 0.1);
  var health = testFarmer.health();
  ok(testFarmer.isAlive());
  equal(testFarmer.eatEggs(1), 0);
  equal(testFarmer.health(), health);
});

test("Eat Negative Eggs", function() {
  var testFarmer = new Farmer();
  var health = testFarmer.health();
  equal(testFarmer.eatEggs(-2), 0);
  equal(testFarmer.health(), health);
});

test("Overeat", function() {
  var testFarmer = new Farmer();
  var health = testFarmer.health();
  // Need two eggs to regain full health.
  testFarmer.setHealth(Farmer.HUNGER_LEVEL - 0.1);
  testFarmer.eatEggs(2);
  equal(testFarmer.health(), 1);
});

test("Metabolize For Interval", function() {
  var testFarmer = new Farmer();
  var health = testFarmer.health();
  equal(health, 1);

  testFarmer.processGameTick(Date.now() / 1000.0, 1);
  ok(testFarmer.health() < health);
  health = testFarmer.health();
  testFarmer.processGameTick(Date.now() / 1000.0, 2.147);
  ok(testFarmer.health() < health);
});

test("Metabolize Negative Interval", function() {
  var testFarmer = new Farmer();
  var health = testFarmer.health();
  testFarmer.processGameTick(Date.now() / 1000.0, -1.5);
  equal(testFarmer.health(), 1);
});

test("Metabolize When Dead", function() {
  var testFarmer = new Farmer();
  testFarmer.setHealth(0);
  equal(testFarmer.isAlive(), false);
  testFarmer.processGameTick(Date.now() / 1000.0, 2.4);
  equal(testFarmer.health(), 0);
});

test("Death Notice", function() {
  // This is an application (large) test: it tests both the notification and the fact
  // that metabolizing for an interval longer than the farmer's life span will cause
  // death.

  // Set up an event listener for the farmerDidDie notification.
  var isDead = false;
  var farmerDidDie = function(farmer) {
    isDead = true;
  };
  var defaultCenter = NotificationDefaultCenter();
  defaultCenter.addNotificationObserver(Farmer.DID_DIE_NOTIFICATION, farmerDidDie);
  var testFarmer = new Farmer();
  testFarmer.setHealth(Farmer.METABOLIC_RATE);  // 1 second of health left.
  ok(testFarmer.isAlive());
  testFarmer.processGameTick(Date.now() / 1000.0, 2);
  ok(isDead);
  equal(testFarmer.isAlive(), false);
  equal(testFarmer.health(), 0);
  defaultCenter.removeNotificationObserver(
      EggCarton.DID_FILL_CARTON_NOTIFICATION, farmerDidDie);
});

test("Has Stats", function() {
  var testFarmer = new Farmer();
  ok(testFarmer.hasStats());
});

test("Display Name", function() {
  var testFarmer = new Farmer();
  ok(testFarmer.displayName() !== "<unnamed>");
});

test("Stats Display String", function() {
  var testFarmer = new Farmer();
  equal(testFarmer.statsDisplayString(), "100.0%");
  testFarmer.setHealth(0.5);
  equal(testFarmer.statsDisplayString(), "50.00%");
  testFarmer.setHealth(0.3146728937);
  equal(testFarmer.statsDisplayString(), "31.47%");
  testFarmer.setHealth(0.03146728937);
  equal(testFarmer.statsDisplayString(), "3.147%");
  testFarmer.setHealth(0);
  equal(testFarmer.statsDisplayString(), "0.000%");
});
