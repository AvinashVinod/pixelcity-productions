import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import ButtonRevealingEffect from "./ButtonRevealingEffect";
import { client } from "../utils/client";
import { GiLoveLetter } from "react-icons/gi";

const CustomDatePicker = () => {
  const [currentDate,    setCurrentDate]    = useState(new Date());
  const [selectedDate,   setSelectedDate]   = useState(null);
  const [isFormVisible,  setIsFormVisible]  = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [error,          setError]          = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email:    '',
    phone:    '',
  });

  const calendarRef  = useRef(null);
  const daysGridRef  = useRef(null);
  const monthRef     = useRef(null);
  const containerRef = useRef(null);

  const getDaysInMonth = (date) => {
    const year     = date.getFullYear();
    const month    = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const days     = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const days     = getDaysInMonth(currentDate);
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  useEffect(() => {
    if (!calendarRef.current) return;
    gsap.fromTo(calendarRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "back.out(0.6)", clearProps: "transform" }
    );
    if (daysGridRef.current) {
      gsap.fromTo(Array.from(daysGridRef.current.children),
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.02, delay: 0.2, ease: "power2.out" }
      );
    }
  }, []);

  const handleConfirmClick = () => {
    if (!selectedDate) {
      setError("Please select a date first.");
      return;
    }
    setError(null);
    setIsFormVisible(true);
    gsap.to(containerRef.current, { x: "-105%", duration: 0.6, ease: "power2.inOut" });
  };

  const handleGoBack = () => {
    setIsFormVisible(false);
    setError(null);
    gsap.to(containerRef.current, { x: "0%", duration: 0.6, ease: "power2.inOut" });
  };

  const animateMonthChange = (newDate) => {
    const tl = gsap.timeline();
    tl.to(monthRef.current,    { scale: 0.95, opacity: 0.5, duration: 0.15, ease: "power2.in" })
      .to(daysGridRef.current, { opacity: 0, y: 15, duration: 0.15, ease: "power2.in" }, 0)
      .call(() => setCurrentDate(newDate))
      .to(monthRef.current,    { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(0.4)" })
      .to(daysGridRef.current, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(0.3)" }, "-=0.1");
  };

  const prevMonth = () => animateMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => animateMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const isToday    = (date) => date && date.toDateString() === new Date().toDateString();
  const isSelected = (date) => selectedDate && date && selectedDate.toDateString() === date.toDateString();

  const handleDateSelect = (date) => {
    if (!date) return;
    const el = document.querySelector(`[data-date="${date.getTime()}"]`);
    if (el) {
      gsap.to(el, {
        scale: 0.85, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut",
        onComplete: () => { setSelectedDate(date); gsap.to(el, { scale: 1, duration: 0.1 }); }
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return "Select a Date";
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  // Format date as YYYY-MM-DD for Sanity date field
  const toSanityDate = (date) => {
    const y  = date.getFullYear();
    const m  = String(date.getMonth() + 1).padStart(2, '0');
    const d  = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await client.create({
        _type:        'enquiry',
        fullName:     formData.fullName,
        email:        formData.email,
        phone:        formData.phone,
        selectedDate: toSanityDate(selectedDate),
        submittedAt:  new Date().toISOString(),
        status:       'new',
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Sanity submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative grid gap-5 overflow-hidden w-full max-w-[380px]" style={{ backgroundColor: "white" }}>
      <div ref={containerRef} className="date-picker__container flex" style={{ transform: "translateX(0%)" }}>

        {/* ── Calendar ── */}
        <div
          ref={calendarRef}
          className="date-picker__calendar grid grid-rows-[4.7rem_0.5fr_auto] rounded-2xl h-full min-h-[550px] w-full max-w-[380px] md:w-[380px] overflow-hidden shrink-0"
          style={{ backgroundColor: "#E3E2DD" }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: "white" }}>
            <div className="flex justify-between items-center">
              <button onClick={prevMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer" style={{ backgroundColor: "#000", color: "white" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 ref={monthRef} className="text-xl font-semibold">
                {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
              </h3>
              <button onClick={nextMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 cursor-pointer" style={{ backgroundColor: "#000", color: "white" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 px-4 pt-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-semibold py-2">{day}</div>
            ))}
          </div>

          <div className="flex flex-col justify-between h-full">
            <div ref={daysGridRef} className="grid grid-cols-7 gap-1 p-4">
              {days.map((date, index) => (
                <button
                  key={index}
                  data-date={date?.getTime()}
                  onClick={() => handleDateSelect(date)}
                  disabled={!date}
                  className={`relative aspect-square rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center shadow-md cursor-pointer
                    ${!date ? "invisible cursor-default" : "hover:scale-110 hover:shadow-md"}`}
                  style={{
                    backgroundColor: date && isSelected(date) ? "#000" : date && isToday(date) ? "white" : "transparent",
                    color:           date && isSelected(date) ? "white" : "#000",
                  }}
                >
                  {date && date.getDate()}
                </button>
              ))}
            </div>

            {error && !isFormVisible && (
              <p className="text-red-500 text-xs text-center px-4">{error}</p>
            )}

            <div className="px-6 pt-3 pb-6 flex gap-2 justify-center">
              <button
                onClick={handleConfirmClick}
                className="group border border-black text-black hover:text-white hover:bg-black w-fit px-10 py-3 transition-all duration-500 rounded-full cursor-pointer pointer-events-auto"
              >
                <ButtonRevealingEffect text="Confirm" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="date-picker__form absolute translate-x-[105%] grow bg-[#E3E2DD] rounded-2xl h-full w-full max-w-[380px] md:w-[380px] shrink-0">
          <div className="h-[calc(100%-4.7rem)] w-full">
            <div className="flex items-center justify-center h-[4.7rem] border-b border-white uppercase">
              <h3 className="text-xl font-semibold">Complete your booking</h3>
            </div>

            {submitted ? (
              // ── Success state ──
              <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center pb-10">
                <div className="text-5xl"><GiLoveLetter /></div>
                <h3 className="text-xl font-semibold">We'll be in touch!</h3>
                <p className="text-sm opacity-70">Your enquiry for <strong>{formatDate(selectedDate)}</strong> has been received. We'll contact you at <strong>{formData.email}</strong> shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col justify-between p-4 pb-6 h-full">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 rounded-lg focus:outline-none bg-white shadow-[inset_0_4px_6px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(0,0,0,0.1)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 rounded-lg focus:outline-none bg-white shadow-[inset_0_4px_6px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(0,0,0,0.1)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2 rounded-lg focus:outline-none bg-white shadow-[inset_0_4px_6px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(0,0,0,0.1)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Selected Date</label>
                    <input
                      type="text"
                      value={formatDate(selectedDate)}
                      readOnly
                      className="w-full px-4 py-2 rounded-lg bg-white focus:outline-none shadow-[inset_0_4px_6px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(0,0,0,0.1)]"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs">{error}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="group flex justify-center border border-black text-black hover:text-white hover:bg-black py-3 transition-all duration-500 rounded-full cursor-pointer"
                  >
                    <ButtonRevealingEffect text="Go Back" />
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group flex justify-center text-white bg-black py-3 transition-all duration-500 rounded-full cursor-pointer disabled:opacity-50"
                  >
                    <ButtonRevealingEffect text={submitting ? "Sending..." : "Submit Booking"} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="">
        <p className="flex gap-2 justify-end items-center">
          We can't wait to meet you!{" "}
          <span className="text-3xl"><GiLoveLetter /></span>
        </p>
      </div>
    </div>
  );
};

export default CustomDatePicker;