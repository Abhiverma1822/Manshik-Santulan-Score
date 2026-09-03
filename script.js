(() => {
    "use strict";

    // =========================================================
    // FastAPI URL
    // =========================================================

    const API_BASE = "http://127.0.0.1:8000";


    // =========================================================
    // Form Elements
    // =========================================================

    const form = document.getElementById("predict-form");
    const submitBtn = document.getElementById("submit-btn");
    const resetBtn = document.getElementById("reset-btn");
    const errorRetryBtn = document.getElementById("error-retry-btn");


    // =========================================================
    // UI States
    // =========================================================

    const stateIdle = document.getElementById("state-idle");
    const stateLoading = document.getElementById("state-loading");
    const stateResult = document.getElementById("state-result");
    const stateError = document.getElementById("state-error");


    // =========================================================
    // Result Elements
    // =========================================================

    const scoreNumberEl = document.getElementById("score-number");
    const scoreBandEl = document.getElementById("score-band");
    const scoreContextEl = document.getElementById("score-context");
    const gaugeFill = document.getElementById("gauge-fill");


    // =========================================================
    // Error Elements
    // =========================================================

    const errorLabelEl = document.getElementById("error-label");
    const errorCopyEl = document.getElementById("error-copy");


    // =========================================================
    // Gauge
    // =========================================================

    const GAUGE_ARC_LENGTH = 314;


    // =========================================================
    // Draw Gauge Tick Marks
    // =========================================================

    function drawTicks() {

        document.querySelectorAll(".gauge-ticks").forEach((g) => {

            g.innerHTML = "";

            const cx = 120;
            const cy = 140;
            const rOuter = 100;
            const rInner = 90;

            for (let i = 0; i <= 10; i += 2) {

                const angle =
                    Math.PI - (i / 10) * Math.PI;

                const x1 =
                    cx + rOuter * Math.cos(angle);

                const y1 =
                    cy - rOuter * Math.sin(angle);

                const x2 =
                    cx + rInner * Math.cos(angle);

                const y2 =
                    cy - rInner * Math.sin(angle);

                const line =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "line"
                    );

                line.setAttribute(
                    "x1",
                    x1.toFixed(1)
                );

                line.setAttribute(
                    "y1",
                    y1.toFixed(1)
                );

                line.setAttribute(
                    "x2",
                    x2.toFixed(1)
                );

                line.setAttribute(
                    "y2",
                    y2.toFixed(1)
                );

                g.appendChild(line);
            }
        });
    }

    drawTicks();


    // =========================================================
    // Stress Level Segmented Control
    // =========================================================

    const segGroup =
        document.getElementById("stress_level_group");

    const stressHiddenInput =
        document.getElementById("stress_level");


    if (segGroup && stressHiddenInput) {

        segGroup
            .querySelectorAll(".seg-btn")
            .forEach((btn) => {

                btn.addEventListener("click", () => {

                    segGroup
                        .querySelectorAll(".seg-btn")
                        .forEach((b) =>
                            b.classList.remove("active")
                        );

                    btn.classList.add("active");

                    stressHiddenInput.value =
                        btn.dataset.value;

                    clearFieldError(
                        stressHiddenInput
                    );
                });
            });
    }


    // =========================================================
    // Field Error Functions
    // =========================================================

    function fieldWrapper(input) {

        return input?.closest(".field");
    }


    function setFieldError(input, message) {

        const wrap = fieldWrapper(input);

        if (!wrap) return;

        wrap.classList.add("field-error");

        const msgEl =
            wrap.querySelector(".error-msg");

        if (msgEl) {
            msgEl.textContent = message;
        }
    }


    function clearFieldError(input) {

        const wrap = fieldWrapper(input);

        if (!wrap) return;

        wrap.classList.remove("field-error");

        const msgEl =
            wrap.querySelector(".error-msg");

        if (msgEl) {
            msgEl.textContent = "";
        }
    }


    function clearAllErrors() {

        if (!form) return;

        form.querySelectorAll(".field")
            .forEach((field) => {

                field.classList.remove(
                    "field-error"
                );
            });

        form.querySelectorAll(".error-msg")
            .forEach((msg) => {

                msg.textContent = "";
            });
    }


    // =========================================================
    // Collect Form Data
    // IMPORTANT:
    // Keys match StudentData in FastAPI
    // =========================================================

    function collectPayload() {

        const fd = new FormData(form);

        return {

            Age:
                fd.get("age") === ""
                    ? NaN
                    : parseInt(
                        fd.get("age"),
                        10
                    ),

            Gender:
                fd.get("gender") || "",

            Country:
                (
                    fd.get("country") || ""
                ).trim(),

            Academic_Level:
                fd.get("academic_level") || "",

            Most_Used_Platform:
                fd.get(
                    "most_used_platform"
                ) || "",

            Purpose_Of_Use:
                fd.get("purpose_of_use") || "",

            // =================================================
            // IMPORTANT:
            // Avg Daily Screen Time = 0 to 24 hours
            // =================================================

            Avg_Daily_Usage_Hours:
                fd.get(
                    "avg_daily_usage_hours"
                ) === ""
                    ? NaN
                    : parseFloat(
                        fd.get(
                            "avg_daily_usage_hours"
                        )
                    ),

            Daily_Unlocks:
                fd.get("daily_unlocks") === ""
                    ? NaN
                    : parseInt(
                        fd.get("daily_unlocks"),
                        10
                    ),

            Study_Hours:
                fd.get("study_hours") === ""
                    ? NaN
                    : parseFloat(
                        fd.get("study_hours")
                    ),

            Physical_Activity_Hours:
                fd.get(
                    "physical_activity_hours"
                ) === ""
                    ? NaN
                    : parseFloat(
                        fd.get(
                            "physical_activity_hours"
                        )
                    ),

            Sleep_Hours_Per_Night:
                fd.get(
                    "sleep_hours_per_night"
                ) === ""
                    ? NaN
                    : parseFloat(
                        fd.get(
                            "sleep_hours_per_night"
                        )
                    ),

            Stress_Level:
                fd.get("stress_level") || ""
        };
    }


    // =========================================================
    // Client-side Validation
    // Matches FastAPI StudentData
    // =========================================================

    function validate(payload) {

        const errors = [];

        const numericChecks = [

            // Age: 10 to 100
            [
                "Age",
                10,
                100,
                "age"
            ],

            // =================================================
            // FIXED:
            // Avg Daily Screen Time: 0 to 24
            // =================================================

            [
                "Avg_Daily_Usage_Hours",
                0,
                24,
                "avg_daily_usage_hours"
            ],

            // Daily Unlocks: 0 or more
            [
                "Daily_Unlocks",
                0,
                Infinity,
                "daily_unlocks"
            ],

            // Study Hours: 0 to 24
            [
                "Study_Hours",
                0,
                24,
                "study_hours"
            ],

            // Physical Activity: 0 to 24
            [
                "Physical_Activity_Hours",
                0,
                24,
                "physical_activity_hours"
            ],

            // Sleep: 0 to 24
            [
                "Sleep_Hours_Per_Night",
                0,
                24,
                "sleep_hours_per_night"
            ]
        ];


        numericChecks.forEach(
            ([key, min, max, elementId]) => {

                const input =
                    document.getElementById(
                        elementId
                    );

                const value =
                    payload[key];


                if (
                    value === "" ||
                    value === null ||
                    Number.isNaN(value)
                ) {

                    errors.push([
                        input,
                        "This field is required."
                    ]);

                } else if (
                    value < min ||
                    value > max
                ) {

                    errors.push([
                        input,
                        `Must be between ${min} and ${max === Infinity
                            ? "∞"
                            : max
                        }.`
                    ]);
                }
            }
        );


        // =====================================================
        // Required Fields
        // =====================================================

        const requiredFields = [

            ["Gender", "gender"],

            ["Country", "country"],

            [
                "Academic_Level",
                "academic_level"
            ],

            [
                "Most_Used_Platform",
                "most_used_platform"
            ],

            [
                "Purpose_Of_Use",
                "purpose_of_use"
            ]
        ];


        requiredFields.forEach(
            ([key, elementId]) => {

                const input =
                    document.getElementById(
                        elementId
                    );

                if (
                    !payload[key] ||
                    String(payload[key]).trim() === ""
                ) {

                    errors.push([
                        input,
                        "This field is required."
                    ]);
                }
            }
        );


        // =====================================================
        // Stress Level
        // =====================================================

        if (!payload.Stress_Level) {

            errors.push([
                stressHiddenInput,
                "Pick a stress level."
            ]);
        }


        return errors;
    }


    // =========================================================
    // UI State
    // =========================================================

    function showState(name) {

        [
            stateIdle,
            stateLoading,
            stateResult,
            stateError
        ].forEach((element) => {

            if (element) {
                element.hidden = true;
            }
        });


        const states = {

            idle: stateIdle,

            loading: stateLoading,

            result: stateResult,

            error: stateError
        };


        if (states[name]) {
            states[name].hidden = false;
        }
    }


    // =========================================================
    // Submit Button
    // =========================================================

    function setSubmitting(isSubmitting) {

        if (!submitBtn) return;

        submitBtn.disabled = isSubmitting;

        submitBtn.classList.toggle(
            "loading",
            isSubmitting
        );
    }


    // =========================================================
    // Score Band
    // =========================================================

    function bandFor(score) {

        if (score < 4) {

            return {

                label: "Signal: strained",

                context:
                    "Your responses suggest elevated strain right now. Small shifts in sleep or screen time can help support your overall wellbeing."
            };
        }


        if (score < 7) {

            return {

                label: "Signal: balanced",

                context:
                    "Your responses suggest a fairly steady pattern, with some room to recover and reset."
            };
        }


        return {

            label: "Signal: strong",

            context:
                "Your responses suggest a relatively well-supported baseline. Keep maintaining healthy routines."
        };
    }


    // =========================================================
    // Render Prediction
    // =========================================================

    function renderResult(score) {

        const clamped =
            Math.max(
                0,
                Math.min(10, score)
            );


        const {
            label,
            context
        } = bandFor(clamped);


        scoreNumberEl.textContent =
            score.toFixed(2);


        scoreBandEl.textContent =
            label;


        scoreContextEl.textContent =
            context;


        if (gaugeFill) {

            gaugeFill.style.transition =
                "none";

            gaugeFill.style.strokeDashoffset =
                String(GAUGE_ARC_LENGTH);


            requestAnimationFrame(() => {

                gaugeFill.style.transition =
                    "";

                const offset =
                    GAUGE_ARC_LENGTH *
                    (1 - clamped / 10);

                gaugeFill.style.strokeDashoffset =
                    String(offset);
            });
        }


        showState("result");
    }


    // =========================================================
    // Render Error
    // =========================================================

    function renderError(label, copy) {

        // error-label HTML mein nahi hai,
        // isliye safely check kar rahe hain

        if (errorLabelEl) {
            errorLabelEl.textContent = label;
        }

        if (errorCopyEl) {
            errorCopyEl.textContent = copy;
        }

        showState("error");
    }


    // =========================================================
    // FastAPI 422 Validation Errors
    // =========================================================

    function applyServerValidationErrors(detail) {

        if (!Array.isArray(detail)) {
            return false;
        }


        let matched = false;


        detail.forEach((err) => {

            const field =
                Array.isArray(err.loc)
                    ? err.loc[err.loc.length - 1]
                    : null;


            // Convert FastAPI field names
            // to HTML element IDs

            const fieldMap = {

                Age: "age",

                Gender: "gender",

                Country: "country",

                Academic_Level:
                    "academic_level",

                Most_Used_Platform:
                    "most_used_platform",

                Purpose_Of_Use:
                    "purpose_of_use",

                Avg_Daily_Usage_Hours:
                    "avg_daily_usage_hours",

                Daily_Unlocks:
                    "daily_unlocks",

                Study_Hours:
                    "study_hours",

                Physical_Activity_Hours:
                    "physical_activity_hours",

                Sleep_Hours_Per_Night:
                    "sleep_hours_per_night",

                Stress_Level:
                    "stress_level"
            };


            const elementId =
                fieldMap[field];


            const input =
                elementId
                    ? document.getElementById(
                        elementId
                    )
                    : null;


            const target =
                field === "Stress_Level"
                    ? stressHiddenInput
                    : input;


            if (target) {

                setFieldError(
                    target,
                    err.msg ||
                    "Invalid value."
                );

                matched = true;
            }
        });


        return matched;
    }


    // =========================================================
    // Submit Form
    // =========================================================

    if (form) {

        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                clearAllErrors();


                const payload =
                    collectPayload();


                const clientErrors =
                    validate(payload);


                // =================================================
                // Client validation
                // =================================================

                if (clientErrors.length > 0) {

                    clientErrors.forEach(
                        ([input, message]) => {

                            if (input) {

                                setFieldError(
                                    input,
                                    message
                                );
                            }
                        }
                    );


                    clientErrors[0][0]?.focus?.();

                    return;
                }


                // =================================================
                // Loading
                // =================================================

                setSubmitting(true);

                showState("loading");


                try {

                    // =================================================
                    // Send request to FastAPI
                    // =================================================

                    const response =
                        await fetch(
                            `${API_BASE}/predict`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Accept":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                    // =================================================
                    // 422 Validation Error
                    // =================================================

                    if (
                        response.status === 422
                    ) {

                        const body =
                            await response
                                .json()
                                .catch(
                                    () => null
                                );


                        const matched =
                            body &&
                            applyServerValidationErrors(
                                body.detail
                            );


                        renderError(

                            "Check your inputs",

                            matched
                                ? "The API rejected some fields. Please check the highlighted fields."
                                : "The API rejected this submission. Please review your inputs."
                        );


                        return;
                    }


                    // =================================================
                    // Other HTTP errors
                    // =================================================

                    if (!response.ok) {

                        let message =
                            `The API returned status ${response.status}.`;


                        const body =
                            await response
                                .json()
                                .catch(
                                    () => null
                                );


                        if (
                            body &&
                            typeof body.detail ===
                            "string"
                        ) {

                            message =
                                body.detail;
                        }


                        renderError(
                            "Prediction failed",
                            message
                        );


                        return;
                    }


                    // =================================================
                    // Successful Response
                    // =================================================

                    const data =
                        await response.json();


                    if (
                        typeof data
                            .predicted_mental_health_score
                        !== "number"
                    ) {

                        renderError(
                            "Unexpected response",
                            "The API responded, but the prediction score was missing."
                        );


                        return;
                    }


                    // =================================================
                    // Display Result
                    // =================================================

                    renderResult(
                        data.predicted_mental_health_score
                    );
                }


                catch (error) {

                    console.error(
                        "API Error:",
                        error
                    );


                    renderError(

                        "Can't reach the server",

                        `Unable to connect to ${API_BASE}. Make sure FastAPI is running on port 8000.`
                    );
                }


                finally {

                    setSubmitting(false);
                }
            }
        );
    }


    // =========================================================
    // Clear Field Error While Typing
    // =========================================================

    if (form) {

        form.querySelectorAll(
            "input, select"
        ).forEach((element) => {

            element.addEventListener(
                "input",
                () => clearFieldError(element)
            );


            element.addEventListener(
                "change",
                () => clearFieldError(element)
            );
        });
    }


    // =========================================================
    // Reset
    // =========================================================

    if (resetBtn) {

        resetBtn.addEventListener(
            "click",
            () => {

                clearAllErrors();

                showState("idle");
            }
        );
    }


    // =========================================================
    // Retry
    // =========================================================

    if (errorRetryBtn) {

        errorRetryBtn.addEventListener(
            "click",
            () => {

                clearAllErrors();

                showState("idle");
            }
        );
    }

})();