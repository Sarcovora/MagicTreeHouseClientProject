// routes/airtableRoutes.js
const express = require('express');
const router = express.Router();
const airtableController = require('../controllers/airtableController');

// GET all available seasons (options from the 'Season' field)
// Corresponds to: GetAllSeason()
router.get('/seasons', airtableController.handleGetAllSeasons);

// POST a new season option (adds choice to 'Season' field)
// Corresponds to: AddNewFolder("24-25") - *Note: Modifies schema*
router.post('/seasons', airtableController.handleAddSeason);

// GET projects filtered by a specific season
// Corresponds to: GetProjectsForSeason("24-25")
router.get('/projects/season/:season', airtableController.handleGetProjectsBySeason);

// GET detailed information for a specific project by its Airtable Record ID
// Corresponds to: GetLandownerInformation(), GetProjectStatus() (combined)
router.get('/projects/details/:recordId', airtableController.handleGetProjectDetails);

// POST a new project (creates a new record in Airtable)
// Corresponds to: AddNewProject(...)
router.post('/projects', airtableController.handleAddProject);


module.exports = router;
