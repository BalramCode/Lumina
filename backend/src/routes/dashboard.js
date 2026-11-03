const express = require("express");
const { User } = require("../models/User");
const { ProfessionalProfile } = require("../models/ProfessionalProfile");
const { LearningModule } = require("../models/LearningModule");
const { UserProgress } = require("../models/UserProgress");
const { requireAuthentication } = require("../middleware/authenticate");

const router = express.Router();

router.get("/summary", requireAuthentication, async (req, res, next) => {
  try {
    const user = req.auth.user;
    const userRole = user.role;
    const userCity = user.location?.city?.trim() || "";

    const [totalModules, userCompleted] = await Promise.all([
      LearningModule.countDocuments({ isPublished: true }),
      UserProgress.countDocuments({ userId: user._id, isCompleted: true }),
    ]);
    const learningProgress = {
      totalModules,
      completedCount: userCompleted,
      progressPercent: totalModules > 0 ? Math.round((userCompleted / totalModules) * 100) : 0,
    };

    if (userRole === "parent") {
      const [totalProfessionals, acceptingClients, inCity, recentDocs] = await Promise.all([
        ProfessionalProfile.countDocuments(),
        ProfessionalProfile.countDocuments({ availability: "accepting_clients" }),
        userCity
          ? ProfessionalProfile.countDocuments({ city: new RegExp(`^${userCity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") })
          : Promise.resolve(0),
        ProfessionalProfile.find()
          .sort({ updatedAt: -1 })
          .limit(3)
          .populate("userId", "name"),
      ]);

      const recentProfessionals = recentDocs.map((doc) => ({
        id: doc._id.toString(),
        name: doc.userId?.name || "Professional",
        professionalType: doc.professionalType,
        city: doc.city,
        languages: doc.languages,
        yearsExperience: doc.yearsExperience,
        availability: doc.availability,
        updatedAt: doc.updatedAt,
      }));

      return res.status(200).json({
        status: "success",
        data: {
          role: "parent",
          metrics: {
            totalProfessionals,
            acceptingClients,
            inMyCity: inCity,
          },
          userCity: userCity || null,
          recentProfessionals,
          learningProgress,
        },
      });
    }

    if (userRole === "therapist") {
      const [myProfile, directorySize, colleaguesInCity] = await Promise.all([
        ProfessionalProfile.findOne({ userId: user._id }).populate("userId", "name"),
        ProfessionalProfile.countDocuments(),
        userCity
          ? ProfessionalProfile.countDocuments({
              city: new RegExp(`^${userCity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
              userId: { $ne: user._id },
            })
          : Promise.resolve(0),
      ]);

      return res.status(200).json({
        status: "success",
        data: {
          role: "therapist",
          hasProfile: Boolean(myProfile),
          profile: myProfile
            ? {
                id: myProfile._id.toString(),
                name: myProfile.userId?.name || user.name,
                professionalType: myProfile.professionalType,
                city: myProfile.city,
                languages: myProfile.languages,
                yearsExperience: myProfile.yearsExperience,
                availability: myProfile.availability,
                bio: myProfile.bio,
                updatedAt: myProfile.updatedAt,
              }
            : null,
          metrics: {
            directorySize,
            colleaguesInCity,
          },
          userCity: userCity || null,
          learningProgress,
        },
      });
    }

    if (userRole === "educator") {
      const [totalEducators, totalProfessionals, totalCommunityMembers] = await Promise.all([
        User.countDocuments({ role: "educator", status: "active" }),
        ProfessionalProfile.countDocuments(),
        User.countDocuments({ status: "active" }),
      ]);

      return res.status(200).json({
        status: "success",
        data: {
          role: "educator",
          metrics: {
            totalEducators,
            totalProfessionals,
            totalCommunityMembers,
          },
          userCity: userCity || null,
          learningProgress,
        },
      });
    }

    if (userRole === "mentor") {
      const [totalMentors, totalParents, totalCommunityMembers] = await Promise.all([
        User.countDocuments({ role: "mentor", status: "active" }),
        User.countDocuments({ role: "parent", status: "active" }),
        User.countDocuments({ status: "active" }),
      ]);

      return res.status(200).json({
        status: "success",
        data: {
          role: "mentor",
          metrics: {
            totalMentors,
            totalParents,
            totalCommunityMembers,
          },
          userCity: userCity || null,
          learningProgress,
        },
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        role: userRole,
        metrics: {},
        learningProgress,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
