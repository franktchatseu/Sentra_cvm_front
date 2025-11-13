import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, ArrowRight, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { accountService } from "../../account/services/accountService";
import { useToast } from "../../../contexts/ToastContext";

export default function RequestAccountPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    reason: "",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const goHome = () => {
    navigate("/login");
  };

  const clearError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};

    if (!formData.department) {
      errors.department = "Department is required";
    }

    if (!formData.position.trim()) {
      errors.position = "Position is required";
    }

    if (!formData.reason.trim()) {
      errors.reason = "Reason for request is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await accountService.createAccountRequest({
        username: formData.email.split("@")[0],
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        department: formData.department || undefined,
      });

      setRequestSubmitted(true);
      success(
        "Account Request Submitted",
        "Your request has been submitted successfully. You will receive a response by email shortly."
      );
    } catch (error: unknown) {
      console.error("Account request failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (
        errorMessage.includes("Email already exists") ||
        errorMessage.includes("already exists")
      ) {
        setValidationErrors({
          email:
            "An account with this email already exists. Please try logging in or use a different email.",
        });
      } else {
        setValidationErrors({
          general:
            "Failed to submit account request. Please try again or contact support.",
        });
        // Filter out HTTP errors
        const userMessage =
          errorMessage.includes("HTTP error") ||
          errorMessage.includes("status:")
            ? "Failed to submit account request. Please try again or contact support."
            : errorMessage;
        showError("Request Failed", userMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      reason: "",
    });
    setCurrentStep(1);
    setRequestSubmitted(false);
    setValidationErrors({});
  };

  const goToRequestsList = () => {
    // Navigate to requests list if it exists
    console.log("Navigate to requests list");
  };

  return (
    <div className="account-request-page">
      {/* Background elements */}
      <div className="bg-gradients"></div>
      <div className="bg-particles"></div>
      <div className="bg-grid"></div>

      {/* Header */}
      <header className="page-header">
        <div className="container">
          <div className="brand-logo">
            <h1 className="brand-name">Sentra</h1>
          </div>
          <button className="btn-back-home" onClick={goHome}>
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="content-wrapper">
            {/* Left side - Info */}
            <div className="info-section">
              <div className="info-content">
                <h1 className="page-title">Request New Account</h1>
                <p className="page-subtitle">
                  Join the Sentra platform and unlock the power of intelligent
                  customer engagement.
                </p>

                <div className="features-list">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <CheckCircle2 size={20} />
                    </div>
                    <span>Advanced campaign management</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <CheckCircle2 size={20} />
                    </div>
                    <span>Real-time analytics & insights</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <CheckCircle2 size={20} />
                    </div>
                    <span>Unified customer view</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <CheckCircle2 size={20} />
                    </div>
                    <span>AI-powered targeting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="form-section">
              <div
                className="form-card"
                style={{ display: requestSubmitted ? "none" : "block" }}
              >
                <div className="form-header">
                  <h2>Account Creation Request</h2>
                  <p>
                    Fill out this form to request an account. Our administrator
                    will review your request and contact you by email.
                  </p>
                </div>

                <form onSubmit={submitRequest} className="request-form">
                  <div
                    className="form-step"
                    style={{ display: currentStep === 1 ? "block" : "none" }}
                  >
                    <div className="step-header">
                      <h3>Personal Information</h3>
                      <div className="step-indicator">Step 1 of 2</div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="firstName">
                          First Name <span className="required">*</span>
                        </label>
                        <input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }));
                            clearError("firstName");
                          }}
                          type="text"
                          required
                          className={
                            validationErrors.firstName ? "invalid" : ""
                          }
                        />
                        <span
                          className="error-message"
                          style={{
                            display: validationErrors.firstName
                              ? "block"
                              : "none",
                          }}
                        >
                          {validationErrors.firstName}
                        </span>
                      </div>

                      <div className="form-group">
                        <label htmlFor="lastName">
                          Last Name <span className="required">*</span>
                        </label>
                        <input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }));
                            clearError("lastName");
                          }}
                          type="text"
                          required
                          className={validationErrors.lastName ? "invalid" : ""}
                        />
                        <span
                          className="error-message"
                          style={{
                            display: validationErrors.lastName
                              ? "block"
                              : "none",
                          }}
                        >
                          {validationErrors.lastName}
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">
                        Personal Email <span className="required">*</span>
                      </label>
                      <input
                        id="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }));
                          clearError("email");
                        }}
                        type="email"
                        required
                        placeholder="your@email.com"
                        className={validationErrors.email ? "invalid" : ""}
                      />
                      <span
                        className="error-message"
                        style={{
                          display: validationErrors.email ? "block" : "none",
                        }}
                      >
                        {validationErrors.email}
                      </span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>

                    <div className="form-navigation">
                      <button
                        type="button"
                        className="btn-next"
                        onClick={nextStep}
                      >
                        Continue
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div
                    className="form-step"
                    style={{ display: currentStep === 2 ? "block" : "none" }}
                  >
                    <div className="step-header">
                      <h3>Professional Information</h3>
                      <div className="step-indicator">Step 2 of 2</div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="department">
                        Department <span className="required">*</span>
                      </label>
                      <select
                        id="department"
                        value={formData.department}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }));
                          clearError("department");
                        }}
                        required
                        className={validationErrors.department ? "invalid" : ""}
                      >
                        <option value="" disabled>
                          Select your department
                        </option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                        <option value="it">IT</option>
                        <option value="hr">Human Resources</option>
                        <option value="finance">Finance</option>
                        <option value="operations">Operations</option>
                      </select>
                      <span
                        className="error-message"
                        style={{
                          display: validationErrors.department
                            ? "block"
                            : "none",
                        }}
                      >
                        {validationErrors.department}
                      </span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="position">
                        Position <span className="required">*</span>
                      </label>
                      <input
                        id="position"
                        value={formData.position}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            position: e.target.value,
                          }));
                          clearError("position");
                        }}
                        type="text"
                        required
                        placeholder="E.g.: Project Manager, Analyst, etc."
                        className={validationErrors.position ? "invalid" : ""}
                      />
                      <span
                        className="error-message"
                        style={{
                          display: validationErrors.position ? "block" : "none",
                        }}
                      >
                        {validationErrors.position}
                      </span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="reason">
                        Reason for Request <span className="required">*</span>
                      </label>
                      <textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            reason: e.target.value,
                          }));
                          clearError("reason");
                        }}
                        required
                        rows={4}
                        placeholder="Please explain why you need an account..."
                        className={validationErrors.reason ? "invalid" : ""}
                      />
                      <span
                        className="error-message"
                        style={{
                          display: validationErrors.reason ? "block" : "none",
                        }}
                      >
                        {validationErrors.reason}
                      </span>
                    </div>

                    <div className="form-navigation">
                      <button
                        type="button"
                        className="btn-back"
                        onClick={prevStep}
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>
                      <button
                        type="submit"
                        className="btn-submit"
                        disabled={isSubmitting}
                      >
                        {!isSubmitting ? (
                          "Submit Request"
                        ) : (
                          <span className="loading-content">
                            <div className="loading-spinner"></div>
                            Submitting...
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Success Message */}
              <div
                className="success-card"
                style={{ display: requestSubmitted ? "block" : "none" }}
              >
                <div className="success-content">
                  <div className="success-icon">
                    <CheckCircle2 size={80} />
                  </div>
                  <h2>Request Submitted Successfully!</h2>
                  <p>
                    Your account creation request has been submitted to our
                    administrator. You will receive a response by email shortly.
                  </p>
                  <div className="success-actions">
                    <button className="btn-primary" onClick={resetForm}>
                      Submit Another Request
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={goToRequestsList}
                    >
                      <List size={18} />
                      View All Requests
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
