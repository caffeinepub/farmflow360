import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use migration pattern for future compatibility.

actor {
  // Authorization system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Users Registry type
  public type UserRecord = {
    principalId : Principal;
    name : Text;
    role : Text;
    createdAt : Int;
  };

  let usersRegistry = Map.empty<Principal, UserRecord>();

  // Stable storage for persistence across upgrades
  stable var stableUserRoles : [(Principal, AccessControl.UserRole)] = [];
  stable var stableAdminAssigned : Bool = false;
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];
  stable var stableUsersRegistry : [(Principal, UserRecord)] = [];

  system func preupgrade() {
    stableUserRoles := accessControlState.userRoles.entries().toArray();
    stableAdminAssigned := accessControlState.adminAssigned;
    stableUserProfiles := userProfiles.entries().toArray();
    stableUsersRegistry := usersRegistry.entries().toArray();
  };

  system func postupgrade() {
    for ((k, v) in stableUserRoles.vals()) {
      accessControlState.userRoles.add(k, v);
    };
    accessControlState.adminAssigned := stableAdminAssigned;
    for ((k, v) in stableUserProfiles.vals()) {
      userProfiles.add(k, v);
    };
    for ((k, v) in stableUsersRegistry.vals()) {
      usersRegistry.add(k, v);
    };
    stableUserRoles := [];
    stableUserProfiles := [];
    stableUsersRegistry := [];
  };

  // User Profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    // Also update name in users registry
    switch (usersRegistry.get(caller)) {
      case (?record) {
        let updated : UserRecord = {
          principalId = record.principalId;
          name = profile.name;
          role = record.role;
          createdAt = record.createdAt;
        };
        usersRegistry.add(caller, updated);
      };
      case (null) {
        let roleText = switch (AccessControl.getUserRole(accessControlState, caller)) {
          case (#admin) "admin";
          case (#user) "user";
          case (#guest) "guest";
        };
        let record : UserRecord = {
          principalId = caller;
          name = profile.name;
          role = roleText;
          createdAt = Time.now();
        };
        usersRegistry.add(caller, record);
      };
    };
  };

  // Users Registry functions
  public shared ({ caller }) func ensureUserInRegistry() : async () {
    if (caller.isAnonymous()) { return };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    switch (usersRegistry.get(caller)) {
      case (?_) {};
      case (null) {
        let roleText = switch (AccessControl.getUserRole(accessControlState, caller)) {
          case (#admin) "admin";
          case (#user) "user";
          case (#guest) "guest";
        };
        // Try to get name from existing profile
        let existingName = switch (userProfiles.get(caller)) {
          case (?p) p.name;
          case (null) "";
        };
        let record : UserRecord = {
          principalId = caller;
          name = existingName;
          role = roleText;
          createdAt = Time.now();
        };
        usersRegistry.add(caller, record);
      };
    };
  };

  // Admin functions for users registry
  public query ({ caller }) func adminGetAllUsers() : async [UserRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    usersRegistry.values().toArray();
  };

  public shared ({ caller }) func adminDeleteUserFromRegistry(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    usersRegistry.remove(user);
    accessControlState.userRoles.remove(user);
    userProfiles.remove(user);
  };

  public shared ({ caller }) func adminUpdateUserRole(user : Principal, newRole : AccessControl.UserRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    AccessControl.assignRole(accessControlState, caller, user, newRole);
    switch (usersRegistry.get(user)) {
      case (?record) {
        let roleText = switch (newRole) {
          case (#admin) "admin";
          case (#user) "user";
          case (#guest) "guest";
        };
        let updated : UserRecord = {
          principalId = record.principalId;
          name = record.name;
          role = roleText;
          createdAt = record.createdAt;
        };
        usersRegistry.add(user, updated);
      };
      case (null) {};
    };
  };

  // Data types
  type Estate = {
    id : Nat;
    userId : Principal;
    name : Text;
    location : Text;
    areaAcres : Float;
    estateCare : Text;
    createdAt : Int;
  };

  type LabourEntry = {
    id : Nat;
    estateId : Nat;
    userId : Principal;
    workerName : Text;
    workType : Text;
    wagePerDay : Float;
    numberOfDays : Nat;
    totalAmount : Float;
    date : Text;
  };

  type RainfallLog = {
    id : Nat;
    estateId : Nat;
    userId : Principal;
    date : Text;
    rainfallMM : Float;
    notes : Text;
  };

  type DailyLog = {
    id : Nat;
    estateId : Nat;
    userId : Principal;
    date : Text;
    rainfallMM : Float;
    fertilizerKg : Float;
    laborHours : Float;
    pesticideMl : Float;
  };

  type CropYield = {
    id : Nat;
    estateId : Nat;
    userId : Principal;
    cropName : Text;
    year : Nat;
    yieldKg : Float;
  };

  type Forecast = {
    id : Nat;
    estateId : Nat;
    userId : Principal;
    cropName : Text;
    forecastDate : Text;
    forecastNote : Text;
  };

  type RevenueEntry = {
    id : Nat;
    estateId : Nat;
    userId : Principal;
    amount : Float;
    description : Text;
    date : Text;
  };

  // Data stores and ID counters
  let estates = Map.empty<Nat, Estate>();
  var nextEstateId = 1;

  let labourEntries = Map.empty<Nat, LabourEntry>();
  var nextLabourEntryId = 1;

  let rainfallLogs = Map.empty<Nat, RainfallLog>();
  var nextRainfallLogId = 1;

  let dailyLogs = Map.empty<Nat, DailyLog>();
  var nextDailyLogId = 1;

  let cropYields = Map.empty<Nat, CropYield>();
  var nextCropYieldId = 1;

  let forecasts = Map.empty<Nat, Forecast>();
  var nextForecastId = 1;

  let revenueEntries = Map.empty<Nat, RevenueEntry>();
  var nextRevenueEntryId = 1;

  // Estates CRUD
  public shared ({ caller }) func createEstate(estate : Estate) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create estates");
    };
    let estateId = nextEstateId;
    nextEstateId += 1;
    let newEstate : Estate = {
      id = estateId;
      userId = caller;
      name = estate.name;
      location = estate.location;
      areaAcres = estate.areaAcres;
      estateCare = estate.estateCare;
      createdAt = Time.now();
    };
    estates.add(estateId, newEstate);
    estateId;
  };

  public query ({ caller }) func getEstate(estateId : Nat) : async Estate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access estates");
    };
    switch (estates.get(estateId)) {
      case (null) { Runtime.trap("Estate not found") };
      case (?estate) {
        if (estate.userId != caller) { Runtime.trap("Unauthorized access") };
        estate;
      };
    };
  };

  public query ({ caller }) func getUserEstates() : async [Estate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access estates");
    };
    let estateIter = estates.values();
    let filteredEstates = estateIter.filter(
      func(estate) { estate.userId == caller }
    );
    filteredEstates.toArray();
  };

  public shared ({ caller }) func deleteEstate(estateId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete estates");
    };
    let estate = switch (estates.get(estateId)) {
      case (null) { Runtime.trap("Estate not found") };
      case (?estate) { estate };
    };
    if (estate.userId != caller) {
      Runtime.trap("Unauthorized: You do not own this estate");
    };
    estates.remove(estateId);
  };

  // Labour Entries CRUD
  public shared ({ caller }) func createLabourEntry(entry : LabourEntry) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create labour entries");
    };
    let entryId = nextLabourEntryId;
    nextLabourEntryId += 1;
    let newEntry : LabourEntry = {
      id = entryId;
      userId = caller;
      estateId = entry.estateId;
      workerName = entry.workerName;
      workType = entry.workType;
      wagePerDay = entry.wagePerDay;
      numberOfDays = entry.numberOfDays;
      totalAmount = entry.totalAmount;
      date = entry.date;
    };
    labourEntries.add(entryId, newEntry);
    entryId;
  };

  public query ({ caller }) func getLabourEntry(entryId : Nat) : async LabourEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access labour entries");
    };
    switch (labourEntries.get(entryId)) {
      case (null) { Runtime.trap("Labour entry not found") };
      case (?entry) {
        if (entry.userId != caller) { Runtime.trap("Unauthorized access") };
        entry;
      };
    };
  };

  public query ({ caller }) func getUserLabourEntries() : async [LabourEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access labour entries");
    };
    let entryIter = labourEntries.values();
    let filteredEntries = entryIter.filter(
      func(entry) { entry.userId == caller }
    );
    filteredEntries.toArray();
  };

  public shared ({ caller }) func deleteLabourEntry(entryId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete labour entries");
    };
    let entry = switch (labourEntries.get(entryId)) {
      case (null) { Runtime.trap("Labour entry not found") };
      case (?entry) { entry };
    };
    if (entry.userId != caller) {
      Runtime.trap("Unauthorized: You do not own this entry");
    };
    labourEntries.remove(entryId);
  };

  // Rainfall Logs CRUD
  public shared ({ caller }) func createRainfallLog(log : RainfallLog) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create rainfall logs");
    };
    let logId = nextRainfallLogId;
    nextRainfallLogId += 1;
    let newLog : RainfallLog = {
      id = logId;
      userId = caller;
      estateId = log.estateId;
      date = log.date;
      rainfallMM = log.rainfallMM;
      notes = log.notes;
    };
    rainfallLogs.add(logId, newLog);
    logId;
  };

  public query ({ caller }) func getRainfallLog(logId : Nat) : async RainfallLog {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access rainfall logs");
    };
    switch (rainfallLogs.get(logId)) {
      case (null) { Runtime.trap("Rainfall log not found") };
      case (?log) {
        if (log.userId != caller) { Runtime.trap("Unauthorized access") };
        log;
      };
    };
  };

  public query ({ caller }) func getUserRainfallLogs() : async [RainfallLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access rainfall logs");
    };
    let logIter = rainfallLogs.values();
    let filteredLogs = logIter.filter(
      func(log) { log.userId == caller }
    );
    filteredLogs.toArray();
  };

  public shared ({ caller }) func deleteRainfallLog(logId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete rainfall logs");
    };
    let log = switch (rainfallLogs.get(logId)) {
      case (null) { Runtime.trap("Rainfall log not found") };
      case (?log) { log };
    };
    if (log.userId != caller) {
      Runtime.trap("Unauthorized: You do not own this log");
    };
    rainfallLogs.remove(logId);
  };

  // Daily Logs CRUD
  public shared ({ caller }) func createDailyLog(log : DailyLog) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create daily logs");
    };
    let logId = nextDailyLogId;
    nextDailyLogId += 1;
    let newLog : DailyLog = {
      id = logId;
      userId = caller;
      estateId = log.estateId;
      date = log.date;
      rainfallMM = log.rainfallMM;
      fertilizerKg = log.fertilizerKg;
      laborHours = log.laborHours;
      pesticideMl = log.pesticideMl;
    };
    dailyLogs.add(logId, newLog);
    logId;
  };

  public query ({ caller }) func getDailyLog(logId : Nat) : async DailyLog {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access daily logs");
    };
    switch (dailyLogs.get(logId)) {
      case (null) { Runtime.trap("Daily log not found") };
      case (?log) {
        if (log.userId != caller) { Runtime.trap("Unauthorized access") };
        log;
      };
    };
  };

  public query ({ caller }) func getUserDailyLogs() : async [DailyLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access daily logs");
    };
    let logIter = dailyLogs.values();
    let filteredLogs = logIter.filter(
      func(log) { log.userId == caller }
    );
    filteredLogs.toArray();
  };

  public shared ({ caller }) func deleteDailyLog(logId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete daily logs");
    };
    let log = switch (dailyLogs.get(logId)) {
      case (null) { Runtime.trap("Daily log not found") };
      case (?log) { log };
    };
    if (log.userId != caller) {
      Runtime.trap("Unauthorized: You do not own this log");
    };
    dailyLogs.remove(logId);
  };

  // Crop Yields CRUD
  public shared ({ caller }) func createCropYield(yield : CropYield) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create crop yields");
    };
    let yieldId = nextCropYieldId;
    nextCropYieldId += 1;
    let newYield : CropYield = {
      id = yieldId;
      userId = caller;
      estateId = yield.estateId;
      cropName = yield.cropName;
      year = yield.year;
      yieldKg = yield.yieldKg;
    };
    cropYields.add(yieldId, newYield);
    yieldId;
  };

  public query ({ caller }) func getCropYield(yieldId : Nat) : async CropYield {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access crop yields");
    };
    switch (cropYields.get(yieldId)) {
      case (null) { Runtime.trap("Crop yield not found") };
      case (?yield) {
        if (yield.userId != caller) { Runtime.trap("Unauthorized access") };
        yield;
      };
    };
  };

  public query ({ caller }) func getUserCropYields() : async [CropYield] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access crop yields");
    };
    let yieldIter = cropYields.values();
    let filteredYields = yieldIter.filter(
      func(yield) { yield.userId == caller }
    );
    filteredYields.toArray();
  };

  public shared ({ caller }) func deleteCropYield(yieldId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete crop yields");
    };
    let yield = switch (cropYields.get(yieldId)) {
      case (null) { Runtime.trap("Crop yield not found") };
      case (?yield) { yield };
    };
    if (yield.userId != caller) {
      Runtime.trap("Unauthorized: You do not own this crop yield");
    };
    cropYields.remove(yieldId);
  };

  // Forecasts CRUD
  public shared ({ caller }) func createForecast(forecast : Forecast) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create forecasts");
    };
    let forecastId = nextForecastId;
    nextForecastId += 1;
    let newForecast : Forecast = {
      id = forecastId;
      userId = caller;
      estateId = forecast.estateId;
      cropName = forecast.cropName;
      forecastDate = forecast.forecastDate;
      forecastNote = forecast.forecastNote;
    };
    forecasts.add(forecastId, newForecast);
    forecastId;
  };

  public query ({ caller }) func getForecast(forecastId : Nat) : async Forecast {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access forecasts");
    };
    switch (forecasts.get(forecastId)) {
      case (null) { Runtime.trap("Forecast not found") };
      case (?forecast) {
        if (forecast.userId != caller) { Runtime.trap("Unauthorized access") };
        forecast;
      };
    };
  };

  public query ({ caller }) func getUserForecasts() : async [Forecast] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access forecasts");
    };
    let forecastIter = forecasts.values();
    let filteredForecasts = forecastIter.filter(
      func(forecast) { forecast.userId == caller }
    );
    filteredForecasts.toArray();
  };

  // Revenue Entries CRUD
  public shared ({ caller }) func createRevenueEntry(entry : RevenueEntry) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create revenue entries");
    };
    let entryId = nextRevenueEntryId;
    nextRevenueEntryId += 1;
    let newEntry : RevenueEntry = {
      id = entryId;
      userId = caller;
      estateId = entry.estateId;
      amount = entry.amount;
      description = entry.description;
      date = entry.date;
    };
    revenueEntries.add(entryId, newEntry);
    entryId;
  };

  public query ({ caller }) func getRevenueEntry(entryId : Nat) : async RevenueEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access revenue entries");
    };
    switch (revenueEntries.get(entryId)) {
      case (null) { Runtime.trap("Revenue entry not found") };
      case (?entry) {
        if (entry.userId != caller) { Runtime.trap("Unauthorized access") };
        entry;
      };
    };
  };

  public query ({ caller }) func getUserRevenueEntries() : async [RevenueEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access revenue entries");
    };
    let entryIter = revenueEntries.values();
    let filteredEntries = entryIter.filter(
      func(entry) { entry.userId == caller }
    );
    filteredEntries.toArray();
  };

  public shared ({ caller }) func deleteRevenueEntry(entryId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete revenue entries");
    };
    let entry = switch (revenueEntries.get(entryId)) {
      case (null) { Runtime.trap("Revenue entry not found") };
      case (?entry) { entry };
    };
    if (entry.userId != caller) {
      Runtime.trap("Unauthorized: You do not own this entry");
    };
    revenueEntries.remove(entryId);
  };

  // Analytics queries
  public query ({ caller }) func getTotalRainfallForUser() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access analytics");
    };
    var total : Float = 0;
    let iter = rainfallLogs.values();
    let filteredLogs = iter.filter(
      func(log) { log.userId == caller }
    );
    let logArray = filteredLogs.toArray();
    for (log in logArray.values()) {
      total += log.rainfallMM;
    };

    let dailyIter = dailyLogs.values();
    let filteredDaily = dailyIter.filter(
      func(log) { log.userId == caller }
    );
    let dailyArray = filteredDaily.toArray();
    for (log in dailyArray.values()) {
      total += log.rainfallMM;
    };
    total;
  };

  public query ({ caller }) func getTotalExpensesForUser() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access analytics");
    };
    var total : Float = 0;
    let iter = labourEntries.values();
    let filteredEntries = iter.filter(
      func(entry) { entry.userId == caller }
    );
    let entryArray = filteredEntries.toArray();
    for (entry in entryArray.values()) {
      total += entry.totalAmount;
    };
    total;
  };

  public query ({ caller }) func getTotalRevenueForUser() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access analytics");
    };
    var total : Float = 0;
    let iter = revenueEntries.values();
    let filteredEntries = iter.filter(
      func(entry) { entry.userId == caller }
    );
    let entryArray = filteredEntries.toArray();
    for (entry in entryArray.values()) {
      total += entry.amount;
    };
    total;
  };

  // Admin functions
  public query ({ caller }) func adminGetAllEstates() : async [Estate] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    let estateIter = estates.values();
    estateIter.toArray();
  };

  public query ({ caller }) func adminGetAllLabourEntries() : async [LabourEntry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    let entryIter = labourEntries.values();
    entryIter.toArray();
  };

  public query ({ caller }) func adminGetAllRainfallLogs() : async [RainfallLog] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    let logIter = rainfallLogs.values();
    logIter.toArray();
  };

  public query ({ caller }) func adminGetAllDailyLogs() : async [DailyLog] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    let logIter = dailyLogs.values();
    logIter.toArray();
  };

  public query ({ caller }) func adminGetAllRevenueEntries() : async [RevenueEntry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    let entryIter = revenueEntries.values();
    entryIter.toArray();
  };

  public query ({ caller }) func adminGetAllCropYields() : async [CropYield] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    let yieldIter = cropYields.values();
    yieldIter.toArray();
  };

  public query ({ caller }) func adminGetAllUserPrincipals() : async [Principal] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    let keysIter = userProfiles.keys();
    keysIter.toArray();
  };

  public shared ({ caller }) func adminDeleteEstate(estateId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    estates.remove(estateId);
  };

  public shared ({ caller }) func adminDeleteLabourEntry(entryId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    labourEntries.remove(entryId);
  };

  public shared ({ caller }) func adminDeleteRainfallLog(logId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    rainfallLogs.remove(logId);
  };

  public shared ({ caller }) func adminDeleteDailyLog(logId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    dailyLogs.remove(logId);
  };

  public shared ({ caller }) func adminDeleteRevenueEntry(entryId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    revenueEntries.remove(entryId);
  };

  public shared ({ caller }) func adminDeleteCropYield(yieldId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Admin only");
    };
    cropYields.remove(yieldId);
  };
};
