const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

/**
 * Create initial admin user and sample data
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@medical-system.local',
        passwordHash: adminPassword,
        role: 'admin',
        fullName: 'System Administrator'
      }
    });

    console.log('👤 Admin user created:', adminUser.username);

    // Create doctor user
    const doctorPassword = await bcrypt.hash('doctor123', 10);

    const doctorUser = await prisma.user.upsert({
      where: { username: 'doctor' },
      update: {},
      create: {
        username: 'doctor',
        email: 'doctor@medical-system.local',
        passwordHash: doctorPassword,
        role: 'doctor',
        fullName: 'Dr. Hao Wu'
      }
    });

    console.log('👨‍⚕️ Doctor user created:', doctorUser.username);

    // Create default workspace
    const workspace = await prisma.workspace.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'HKU Orthopedics Research',
        description: 'University of Hong Kong orthopedics department research workspace',
        createdById: adminUser.id
      }
    });

    console.log('🏢 Default workspace created:', workspace.name);

    // Import patients from generated_patients.json if it exists
    try {
      const patientsJsonPath = path.join(__dirname, '../../../generated_patients.json');
      const patientsData = JSON.parse(await fs.readFile(patientsJsonPath, 'utf8'));

      console.log(`📋 Found ${patientsData.length} patients to import...`);

      let importedCount = 0;

      for (const patientData of patientsData.slice(0, 50)) { // Import first 50 for demo
        try {
          // Separate nested objects
          const { red_flags, cervical_function_problems, ...mainData } = patientData;

          // Map fields to match database schema
          const mappedData = {
            workspaceId: workspace.id,
            studyId: mainData.study_id,
            age: mainData.age,
            gender: mainData.gender,
            phone: mainData.phone,
            chiefComplaint: mainData.chief_complaint,
            historyType: mainData.history_type,
            firstOnsetDate: mainData.first_onset_date ? new Date(mainData.first_onset_date) : null,
            painType: mainData.pain_type,
            aggravatingFactors: mainData.aggravating_factors,
            relievingFactors: mainData.relieving_factors,
            hasRadiation: mainData.has_radiation,
            radiationLocation: mainData.radiation_location,
            previousTreatment: mainData.previous_treatment,
            conditionProgress: mainData.condition_progress,
            painScore: mainData.pain_score,
            sittingTolerance: mainData.sitting_tolerance,
            standingTolerance: mainData.standing_tolerance,
            walkingTolerance: mainData.walking_tolerance,
            claudicationDistance: mainData.claudication_distance,
            rmdqScore: mainData.rmdq_score,
            ndiScore: mainData.ndi_score,
            assistiveTools: mainData.assistive_tools,
            cervicalPosture: mainData.cervical_posture,
            lumbarPosture: mainData.lumbar_posture,
            distalPulse: mainData.distal_pulse,
            medicationDetails: mainData.medication_details,
            remarks: mainData.remarks,
            createdById: doctorUser.id,
            createdAt: mainData.created_date ? new Date(mainData.created_date) : new Date()
          };

          const patient = await prisma.patient.create({
            data: mappedData
          });

          // Create red flags if present
          if (red_flags) {
            await prisma.patientRedFlag.create({
              data: {
                patientId: patient.id,
                weightLoss: red_flags.weight_loss || false,
                appetiteLoss: red_flags.appetite_loss || false,
                fever: red_flags.fever || false,
                nightPain: red_flags.night_pain || false,
                bladderBowelDysfunction: red_flags.bladder_bowel_dysfunction || false,
                saddleNumbness: red_flags.saddle_numbness || false,
                bilateralLimbWeakness: red_flags.bilateral_limb_weakness || false,
                bilateralSensoryAbnormal: red_flags.bilateral_sensory_abnormal || false,
                handClumsiness: red_flags.hand_clumsiness || false,
                gaitAbnormal: red_flags.gait_abnormal || false
              }
            });
          }

          // Create cervical function data if present
          if (cervical_function_problems) {
            await prisma.patientCervicalFunction.create({
              data: {
                patientId: patient.id,
                droppingObjects: cervical_function_problems.dropping_objects || false,
                difficultyPickingSmallItems: cervical_function_problems.difficulty_picking_small_items || false,
                writingDifficulty: cervical_function_problems.writing_difficulty || false,
                phoneUsageDifficulty: cervical_function_problems.phone_usage_difficulty || false,
                buttoningDifficulty: cervical_function_problems.buttoning_difficulty || false,
                chopstickUsageDifficulty: cervical_function_problems.chopstick_usage_difficulty || false
              }
            });
          }

          importedCount++;

        } catch (error) {
          console.warn(`⚠️ Failed to import patient ${patientData.study_id}:`, error.message);
        }
      }

      console.log(`✅ Imported ${importedCount} patients successfully`);

    } catch (error) {
      console.log('ℹ️ No generated_patients.json found or failed to import:', error.message);
    }

    console.log('✅ Database seeding completed!');

    // Print login credentials
    console.log('\n🔐 Default Login Credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Doctor: username=doctor, password=doctor123');
    console.log('\n⚠️ Please change these default passwords in production!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };