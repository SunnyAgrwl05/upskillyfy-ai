/* =========================================================
   ASSESSMENT SEED — server-side re-export
   ------------------------------------------------------------
   The client and the server share one source of truth for the
   sample assessment data. This module simply re-exports the
   named exports of the shared dataset and adapts them to the
   shape the assessment routes expect.
   ========================================================= */

import {
  BRANCHES,
  ASSESSMENTS,
  ASSESSMENTS_BUILT,
  DEFAULT_MARKING,
  DEFAULT_NEGATIVE_MARKS,
  getBranchesWithCounts,
  getAssessmentsByBranch,
  getAssessmentById,
  getBranchById,
} from '../../client/src/data/assessmentsSeed.js'

export {
  BRANCHES,
  ASSESSMENTS,
  ASSESSMENTS_BUILT,
  DEFAULT_MARKING,
  DEFAULT_NEGATIVE_MARKS,
  getBranchesWithCounts,
  getAssessmentsByBranch,
  getAssessmentById,
  getBranchById,
}

/**
 * Build the payload the assessment routes consume.
 */
export function seedAssessments() {
  return {
    branches: BRANCHES,
    assessments: ASSESSMENTS_BUILT,
    branchesWithCounts: getBranchesWithCounts(),
    assessmentsByBranch: getAssessmentsByBranch,
  }
}
