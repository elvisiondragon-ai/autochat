import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, Heart, Send, ImageIcon, RefreshCw } from "lucide-react";

export interface AutomationWizardProps {
    userId: string;
    metaInstagramId?: string | null;
    metaAccessToken?: string | null;
    initialData?: any; // To support editing existing triggers
    onSuccess: () => void;
    onCancel: () => void;
}

// Types
interface IgMedia {
    id: string;
    media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    thumbnail_url?: string;
    media_url?: string;
    caption?: string;
    timestamp: string;
    permalink: string;
}

// ── Live Phone Mockup Preview ─────────────────────────────────────────────────
const PhonePreview = ({ step, flowType, keyword, isAnyWord, commentReplies, enableCommentReply, triggerSource, selectedPost, step4Text, step4BtnType, step4Buttons, step5Text, step5BtnType, step5Buttons, step6Text, step6UrlTitle, step6UrlLink }: {
    step: number; flowType: "direct" | "sequence"; keyword: string; isAnyWord: boolean; commentReplies: string[]; enableCommentReply: boolean; triggerSource: string; selectedPost?: IgMedia | null;
    step4Text: string; step4BtnType: string; step4Buttons: any[];
    step5Text: string; step5BtnType: string; step5Buttons: any[];
    step6Text: string; step6UrlTitle: string; step6UrlLink: string;
}) => {
    const isDM = triggerSource === "chat_ig_fb" || step >= 4;
    const showCommentPreview = step >= 3 && triggerSource === "komentar_ig_fb" && enableCommentReply && commentReplies[0]?.trim() !== "";
    const showKeyword = step >= 3 && (isAnyWord || keyword.trim() !== "");
    const postThumbnail = selectedPost?.thumbnail_url || selectedPost?.media_url;

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [step, step4Text, step5Text, step6Text]);

    return (
        <div className="flex flex-col items-center justify-center h-full">
            {/* Phone Frame */}
            <div className="relative w-[220px] h-[420px] rounded-[36px] bg-[#1c1c1e] border-[3px] border-[#3a3a3c] shadow-2xl overflow-hidden select-none">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1c1c1e] rounded-b-2xl z-10" />

                {/* Screen */}
                <div className="absolute inset-0 flex flex-col bg-[#000000]">
                    {/* Header */}
                    <div className="px-4 pt-7 pb-2 border-b border-[#2c2c2e]">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center">
                                <div className="h-5 w-5 rounded-full bg-[#1c1c1e] flex items-center justify-center text-[7px] text-white font-bold">IG</div>
                            </div>
                            <span className="text-white text-xs font-semibold">
                                {isDM ? "Direct Messages" : "Comments"}
                            </span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto hide-scrollbar p-3 pb-6 flex flex-col gap-2">
                        {!isDM ? (
                            <>
                                {/* Post preview - show actual post or placeholder */}
                                <div className="rounded-lg bg-[#1c1c1e] overflow-hidden">
                                    {postThumbnail ? (
                                        <img src={postThumbnail} alt="post" className="h-16 w-full object-cover" />
                                    ) : (
                                        <div className="h-16 bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center text-[10px] text-white/60">
                                            📸 Your Post
                                        </div>
                                    )}
                                    <div className="px-2 py-1 flex gap-3 text-[#adadad]">
                                        <Heart className="h-3 w-3" />
                                        <MessageCircle className="h-3 w-3" />
                                        <Send className="h-3 w-3 ml-auto" />
                                    </div>
                                </div>

                                {/* Comments section */}
                                <div className="text-[9px] font-semibold text-[#adadad] px-1">Comments</div>
                                <div className="flex items-start gap-2 px-1">
                                    <div className="h-5 w-5 rounded-full bg-[#3a3a3c] shrink-0" />
                                    <div>
                                        <span className="text-white text-[9px] font-semibold mr-1">username</span>
                                        <AnimatePresence mode="wait">
                                            <motion.span key={keyword} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#adadad] text-[9px]">
                                                {showKeyword ? keyword : "Leaves a comment..."}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Bot comment reply */}
                                {showCommentPreview && (
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 px-1 pl-8">
                                        <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shrink-0 flex items-center justify-center text-[6px] font-bold text-white">🤖</div>
                                        <div>
                                            <span className="text-white text-[9px] font-semibold mr-1">your_page</span>
                                            <span className="text-[#adadad] text-[9px]">{commentReplies[0]}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="text-[9px] font-semibold text-[#adadad] text-center px-1 pb-1">Direct Message</div>
                                {showKeyword && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end">
                                        <div className="max-w-[120px] rounded-2xl rounded-br-sm bg-[#0095f6] px-3 py-1.5">
                                            <span className="text-white text-[9px]">{isAnyWord ? "(any message)" : (keyword || "user message")}</span>
                                        </div>
                                    </motion.div>
                                )}
                                {/* Step 4 View: Choice UI */}
                                {step === 4 && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-2 mt-4 items-center">
                                        <div className="w-full p-2 rounded-xl bg-[#2c2c2e] border border-[#3a3a3c] text-center">
                                            <span className="text-white text-[10px] font-bold">Pilih Aliran Chat</span>
                                        </div>
                                        <div className={`w-full p-3 rounded-xl border-2 transition-all ${flowType === "direct" ? "border-primary bg-primary/10" : "border-[#3a3a3c] bg-transparent"}`}>
                                            <span className="text-white text-[9px] font-bold block">A. Simpel Link</span>
                                            <span className="text-[#adadad] text-[7px]">Satu pesan + URL</span>
                                        </div>
                                        <div className={`w-full p-3 rounded-xl border-2 transition-all ${flowType === "sequence" ? "border-primary bg-primary/10" : "border-[#3a3a3c] bg-transparent"}`}>
                                            <span className="text-white text-[9px] font-bold block">B. Sequence</span>
                                            <span className="text-[#adadad] text-[7px]">Flow interaktif</span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 5 View (Opening DM) */}
                                {step >= 5 && step4Text.trim() && (
                                    <>
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-end gap-1 mt-2">
                                            <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shrink-0 flex items-center justify-center text-[6px] font-bold text-white">🤖</div>
                                            <div className="max-w-[140px] rounded-2xl rounded-bl-sm bg-[#2c2c2e] px-3 py-1.5 break-words">
                                                <span className="text-white text-[9px]">{step4Text}</span>
                                                {(flowType === "direct" || step4BtnType === "web_url") && step4Buttons.filter(b => b.title.trim()).map((btn, i) => (
                                                    <div key={i} className="mt-1 rounded-lg bg-[#0095f6] px-3 py-1.5 text-center">
                                                        <span className="text-[7px] text-white font-bold">{btn.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                        {flowType === "sequence" && step4BtnType === "quick_reply" && (
                                            <div className="pl-6 flex flex-wrap gap-1 mt-1">
                                                {step4Buttons.filter(b => b.title.trim()).map((btn, i) => (
                                                    <div key={i} className="rounded-full border border-[#3a3a3c] px-3 py-1 text-center bg-transparent">
                                                        <span className="text-[#0095f6] text-[9px] font-semibold">{btn.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Step 6 User Click Simulation */}
                                {step >= 6 && flowType === "sequence" && step4BtnType === "quick_reply" && step4Buttons[0]?.title && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end mt-2">
                                        <div className="max-w-[120px] rounded-2xl rounded-br-sm bg-[#0095f6] px-3 py-1.5">
                                            <span className="text-white text-[9px]">{step4Buttons[0].title}</span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 6 View (Follow-up DM) */}
                                {step >= 6 && flowType === "sequence" && step5Text.trim() && (
                                    <>
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-end gap-1 mt-2">
                                            <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shrink-0 flex items-center justify-center text-[6px] font-bold text-white">🤖</div>
                                            <div className="max-w-[140px] rounded-2xl rounded-bl-sm bg-[#2c2c2e] px-3 py-1.5 break-words">
                                                <span className="text-white text-[9px]">{step5Text}</span>
                                                {step5BtnType === "web_url" && step5Buttons.filter(b => b.title.trim()).map((btn, i) => (
                                                    <div key={i} className="mt-1 rounded-lg bg-[#0095f6] px-3 py-1.5 text-center">
                                                        <span className="text-[7px] text-white font-bold">{btn.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                        {step5BtnType === "quick_reply" && (
                                            <div className="pl-6 flex flex-wrap gap-1 mt-1">
                                                {step5Buttons.filter(b => b.title.trim()).map((btn, i) => (
                                                    <div key={i} className="rounded-full border border-[#3a3a3c] px-3 py-1 text-center bg-transparent">
                                                        <span className="text-[#0095f6] text-[9px] font-semibold">{btn.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Step 7 User Click Simulation */}
                                {step >= 7 && flowType === "sequence" && step5BtnType === "quick_reply" && step5Buttons[0]?.title && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end mt-2">
                                        <div className="max-w-[120px] rounded-2xl rounded-br-sm bg-[#0095f6] px-3 py-1.5">
                                            <span className="text-white text-[9px]">{step5Buttons[0].title}</span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 7 View (Final Ending) */}
                                {step >= 7 && flowType === "sequence" && step6Text.trim() && (
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-end gap-1 mt-2">
                                        <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shrink-0 flex items-center justify-center text-[6px] font-bold text-white">🤖</div>
                                        <div className="max-w-[140px] rounded-2xl rounded-bl-sm bg-[#2c2c2e] px-3 py-1.5 break-words">
                                            <span className="text-white text-[9px]">{step6Text}</span>
                                            {step6UrlTitle.trim() && (
                                                <div className="mt-1 rounded-lg bg-[#0095f6] px-3 py-1.5 text-center">
                                                    <span className="text-[9px] text-white font-bold">{step6UrlTitle}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
                            </>
                        )}
                    </div>

                    {/* Bottom bar */}
                    <div className="px-3 pb-3 pt-1 border-t border-[#2c2c2e]">
                        <div className="flex items-center gap-2 bg-[#1c1c1e] rounded-full px-3 py-1.5">
                            <span className="text-[9px] text-[#636366] flex-1">Message...</span>
                            <Send className="h-3 w-3 text-[#636366]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Caption below phone */}
            <div className="mt-3 text-center">
                <p className="text-xs font-medium text-muted-foreground">
                    {step === 1 && "Pilih sumber trigger"}
                    {step === 2 && "Pilih target postingan"}
                    {step === 3 && (keyword ? `Keyword: "${keyword}"` : "Ketik keyword...")}
                    {step === 4 && "Pilih Alur Chat"}
                    {step === 5 && (flowType === "direct" ? "Preview Pesan & Link" : "Langkah 1 Preview")}
                    {step === 6 && "Langkah 2 Preview"}
                    {step === 7 && "Langkah 3 Preview"}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Live Preview</p>
            </div>
        </div>
    );
};


// ── Main Wizard Component ─────────────────────────────────────────────────────
export const AutomationWizard: React.FC<AutomationWizardProps> = ({ userId, metaInstagramId, metaAccessToken, initialData, onSuccess, onCancel }) => {
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [targetPost, setTargetPost] = useState<string>("");
    const [selectedPost, setSelectedPost] = useState<IgMedia | null>(null);
    const [showPostPicker, setShowPostPicker] = useState(false);
    const [triggerSource, setTriggerSource] = useState<string>("");
    // Keyword State
    const [isAnyWord, setIsAnyWord] = useState<boolean>(true); // Any word default
    const [keyword, setKeyword] = useState<string>("");
    // Comment Reply State
    const [enableCommentReply, setEnableCommentReply] = useState<boolean>(true); // Default to ON
    const [commentReplies, setCommentReplies] = useState<string[]>(["Cek Dm Kak 🚀"]); // Max 3
    // --- NEW BRANCHING FLOW (7 STEPS) ---
    const [flowType, setFlowType] = useState<"direct" | "sequence">("sequence");
    const [isFollowerOnly, setIsFollowerOnly] = useState<boolean>(false);

    // Step 5 State (Opening DM - Previously Step 4)
    const [step4Text, setStep4Text] = useState<string>("");
    const [step4BtnType, setStep4BtnType] = useState<"quick_reply" | "web_url">("quick_reply");
    const [step4Buttons, setStep4Buttons] = useState<{ title: string, url: string }[]>([{ title: "", url: "" }]);

    // Step 6 State (Follow-up DM - Previously Step 5)
    const [step5Text, setStep5Text] = useState<string>("");
    const [step5BtnType, setStep5BtnType] = useState<"quick_reply" | "web_url">("quick_reply");
    const [step5Buttons, setStep5Buttons] = useState<{ title: string, url: string }[]>([{ title: "", url: "" }]);

    // Step 7 State (Final Web Link - Previously Step 6)
    const [step6Text, setStep6Text] = useState<string>("");
    const [step6UrlTitle, setStep6UrlTitle] = useState<string>("");
    const [step6UrlLink, setStep6UrlLink] = useState<string>("");

    // --- Branching / Routing State (4 New Fields) ---
    const [step4Button1LeadsTo, setStep4Button1LeadsTo] = useState<"step5" | "step6">("step5");
    const [step4Button2LeadsTo, setStep4Button2LeadsTo] = useState<"step5" | "step6">("step6");
    const [step5Button1LeadsTo, setStep5Button1LeadsTo] = useState<"step6" | "repeat_step5">("step6");
    const [step5Button2LeadsTo, setStep5Button2LeadsTo] = useState<"step6" | "repeat_step5">("repeat_step5");

    // Steps initialized empty, will be populated by useEffect if editing
    // ----------------------------------------
    // IG Posts State
    const [igPosts, setIgPosts] = useState<IgMedia[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);

    // Populate state if editing existing trigger
    useEffect(() => {
        if (initialData) {
            setTriggerSource(initialData.trigger_source || "komentar_ig_fb");
            if (initialData.target_post && initialData.target_post !== "any_post") {
                setTargetPost("specific");
                setSelectedPost({ id: initialData.target_post, media_url: "" } as any);
            } else {
                setTargetPost("all");
            }
            setIsAnyWord(initialData.is_any_word || false);
            setKeyword(initialData.keyword === "*" ? "" : (initialData.keyword || ""));

            if (initialData.comment_reply) {
                setEnableCommentReply(true);
                const replies = [initialData.comment_reply, initialData.comment_reply_2, initialData.comment_reply_3].filter(Boolean);
                if (replies.length > 0) setCommentReplies(replies as string[]);
            }

            setStep4Text(initialData.step4_text || "");
            setStep4BtnType(initialData.step4_button_type || "quick_reply");
            setStep4Buttons([
                { title: initialData.step4_button1_text || "", url: initialData.step4_button1_url || "" },
                { title: initialData.step4_button2_text || "", url: initialData.step4_button2_url || "" }
            ]);

            setStep5Text(initialData.step5_text || "");
            setStep5BtnType(initialData.step5_button_type || "quick_reply");
            setStep5Buttons([
                { title: initialData.step5_button1_text || "", url: initialData.step5_button1_url || "" },
                { title: initialData.step5_button2_text || "", url: initialData.step5_button2_url || "" }
            ]);

            setStep6Text(initialData.step6_text || "");
            setStep6UrlTitle(initialData.step6_button_text || "");
            setStep6UrlLink(initialData.step6_button_url || "");

            setStep4Button1LeadsTo(initialData.step4_button1_leads_to === "step6_follower_only" ? "step6" : (initialData.step4_button1_leads_to || "step5"));
            setStep4Button2LeadsTo(initialData.step4_button2_leads_to === "step6_follower_only" ? "step6" : (initialData.step4_button2_leads_to || "step6"));
            setStep5Button1LeadsTo(initialData.step5_button1_leads_to === "step6_follower_only" ? "step6" : (initialData.step5_button1_leads_to || "step6"));
            setStep5Button2LeadsTo(initialData.step5_button2_leads_to === "step6_follower_only" ? "step6" : (initialData.step5_button2_leads_to || "repeat_step5"));

            // Infer flowType
            if (initialData.step5_text || initialData.step6_text) {
                setFlowType("sequence");
                if (initialData.step5_button1_leads_to === "step6_follower_only" || initialData.step5_button2_leads_to === "step6_follower_only" || initialData.step4_button1_leads_to === "step6_follower_only" || initialData.step4_button2_leads_to === "step6_follower_only") {
                    setIsFollowerOnly(true);
                } else {
                    setIsFollowerOnly(false);
                }
            } else if (initialData.step4_button_type === "web_url") {
                setFlowType("direct");
                setIsFollowerOnly(false);
            }
        }
    }, [initialData]);

    const fetchIgPosts = async () => {
        if (!metaInstagramId || !metaAccessToken) return;
        setIsLoadingPosts(true);
        try {
            // First attempt: treat metaInstagramId as a real IG Business Account ID
            const res = await fetch(
                `https://graph.facebook.com/v22.0/${metaInstagramId}/media?fields=id,media_type,thumbnail_url,media_url,caption,timestamp,permalink&limit=10&access_token=${metaAccessToken}`
            );
            const data = await res.json();

            // If 404, the stored ID might actually be a Facebook Page ID, not an IG ID
            // Try to resolve the real IG Business Account ID from it
            if (data.error?.code === 100 || res.status === 404) {
                console.warn("[AutoChat] metaInstagramId returned 404 — trying to resolve IG ID from Page ID...");
                const pageRes = await fetch(
                    `https://graph.facebook.com/v22.0/${metaInstagramId}?fields=instagram_business_account&access_token=${metaAccessToken}`
                );
                const pageData = await pageRes.json();
                const realIgId = pageData?.instagram_business_account?.id;

                if (realIgId) {
                    console.log(`[AutoChat] Resolved real IG ID: ${realIgId}, retrying media fetch...`);
                    const retryRes = await fetch(
                        `https://graph.facebook.com/v22.0/${realIgId}/media?fields=id,media_type,thumbnail_url,media_url,caption,timestamp,permalink&limit=10&access_token=${metaAccessToken}`
                    );
                    const retryData = await retryRes.json();
                    if (retryData.error) throw new Error(`IG API Error: ${retryData.error.message}`);
                    setIgPosts(retryData.data || []);
                    return;
                } else {
                    throw new Error(`ID yang tersimpan (${metaInstagramId}) bukan IG Business Account. Silakan Disconnect lalu Connect Meta ulang.`);
                }
            }

            if (data.error) throw new Error(data.error.message);
            setIgPosts(data.data || []);
        } catch (err: any) {
            toast({ title: "Gagal memuat postingan", description: err.message, variant: "destructive" });
        } finally {
            setIsLoadingPosts(false);
        }
    };

    // Fetch posts when entering step 2
    useEffect(() => {
        if (step === 2 && targetPost === "post_tertentu" && igPosts.length === 0) {
            fetchIgPosts();
        }
    }, [step, targetPost]);

    const handleNext = () => {
        if (step === 1) {
            if (!triggerSource) return toast({ description: "Pilih sumber Trigger", variant: "destructive" });
            if (triggerSource !== "komentar_ig_fb") { setStep(3); return; }
        }
        if (step === 2) {
            if (!targetPost) return toast({ description: "Pilih Post terlebih dahulu", variant: "destructive" });
            if (targetPost === "post_tertentu" && !selectedPost) return toast({ description: "Pilih salah satu postingan", variant: "destructive" });
        }
        if (step === 3) {
            if (!isAnyWord && !keyword.trim()) return toast({ description: "Keyword tidak boleh kosong", variant: "destructive" });
            if (triggerSource === "komentar_ig_fb" && enableCommentReply) {
                const activeReplies = commentReplies.filter(r => r.trim());
                if (activeReplies.length === 0) return toast({ description: "Masukkan setidaknya 1 balasan komentar", variant: "destructive" });
            }
            setStep(4); return;
        }
        if (step === 4) {
            if (!flowType) return toast({ description: "Pilih tipe aliran chat", variant: "destructive" });
            // If direct, step 5 is opening DM with URL. 
            // If sequence, step 5 is opening DM with buttons.
            setStep(5); return;
        }
        if (step === 5) {
            if (!step4Text.trim()) return toast({ description: "Pesan DM wajib diisi", variant: "destructive" });
            if (flowType === "direct") {
                // Handle as Save if it's direct? No, Footer handles it.
                return;
            }
            setStep(6); return;
        }
        if (step === 6) {
            if (!step5Text.trim()) return toast({ description: "Pesan Lanjutan wajib diisi", variant: "destructive" });
            setStep(7); return;
        }
        if (step < 7) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSave = async () => {
        // Validation
        if (!step4Text.trim()) {
            return toast({ description: "Pesan DM (Langkah 5) tidak boleh kosong", variant: "destructive" });
        }

        if (flowType === "sequence") {
            if (!step5Text.trim()) return toast({ description: "Pesan Follow-up (Langkah 6) tidak boleh kosong", variant: "destructive" });
            if (!step6Text.trim()) return toast({ description: "Pesan Ending (Langkah 7) tidak boleh kosong", variant: "destructive" });
        }

        setIsSaving(true);
        try {
            const activeComments = enableCommentReply ? commentReplies.filter(r => r.trim()) : [];
            const cRep1 = activeComments[0] || null;
            const cRep2 = activeComments[1] || null;
            const cRep3 = activeComments[2] || null;

            // Helper to clean buttons payload
            const getBtnAttr = (btns: any[], idx: number, key: 'title' | 'url') => {
                const item = btns[idx];
                return item && item[key] && item[key].trim() ? item[key].trim() : null;
            };

            const payload = {
                user_id: userId,
                target_post: selectedPost ? selectedPost.id : (triggerSource === "komentar_ig_fb" ? targetPost : "any_post"),
                trigger_source: triggerSource,
                keyword: isAnyWord ? "*" : keyword,
                is_any_word: isAnyWord,
                comment_reply: (triggerSource === "komentar_ig_fb" && cRep1) ? cRep1 : null,
                comment_reply_2: (triggerSource === "komentar_ig_fb" && cRep2) ? cRep2 : null,
                comment_reply_3: (triggerSource === "komentar_ig_fb" && cRep3) ? cRep3 : null,

                step4_text: step4Text,
                step4_button_type: flowType === "direct" ? "web_url" : step4BtnType,
                step4_button1_text: getBtnAttr(step4Buttons, 0, 'title'),
                step4_button1_url: (flowType === "direct" || step4BtnType === "web_url") ? getBtnAttr(step4Buttons, 0, 'url') : null,
                step4_button2_text: flowType === "direct" ? null : getBtnAttr(step4Buttons, 1, 'title'),
                step4_button2_url: (flowType === "sequence" && step4BtnType === "web_url") ? getBtnAttr(step4Buttons, 1, 'url') : null,

                step5_text: flowType === "sequence" ? step5Text : null,
                step5_button_type: flowType === "sequence" ? step5BtnType : null,
                step5_button1_text: flowType === "sequence" ? getBtnAttr(step5Buttons, 0, 'title') : null,
                step5_button1_url: (flowType === "sequence" && step5BtnType === "web_url") ? getBtnAttr(step5Buttons, 0, 'url') : null,
                step5_button2_text: flowType === "sequence" ? getBtnAttr(step5Buttons, 1, 'title') : null,
                step5_button2_url: (flowType === "sequence" && step5BtnType === "web_url") ? getBtnAttr(step5Buttons, 1, 'url') : null,

                step6_text: flowType === "sequence" ? step6Text : null,
                step6_button_text: flowType === "sequence" ? (step6UrlTitle.trim() || null) : null,
                step6_button_url: flowType === "sequence" ? (step6UrlLink.trim() || null) : null,

                step4_button1_leads_to: isFollowerOnly && step4Button1LeadsTo === "step6" ? "step6_follower_only" : step4Button1LeadsTo,
                step4_button2_leads_to: isFollowerOnly && step4Button2LeadsTo === "step6" ? "step6_follower_only" : step4Button2LeadsTo,
                step5_button1_leads_to: isFollowerOnly && step5Button1LeadsTo === "step6" ? "step6_follower_only" : step5Button1LeadsTo,
                step5_button2_leads_to: isFollowerOnly && step5Button2LeadsTo === "step6" ? "step6_follower_only" : step5Button2LeadsTo,

                is_active: initialData?.is_active ?? true,
            };

            let error;
            if (initialData?.id) {
                // Update existing
                const res = await supabase.from("autochat_triggers").update(payload).eq("id", initialData.id);
                error = res.error;
            } else {
                // Insert new
                const res = await supabase.from("autochat_triggers").insert(payload);
                error = res.error;
            }

            if (error) throw error;

            toast({ title: initialData?.id ? "Automation Berhasil Diupdate! 🎉" : "Automation Berhasil Dibuat! 🎉", description: `Keyword "${keyword}" aktif.` });
            onSuccess();
        } catch (err: any) {
            toast({ title: "Gagal menyimpan automation", description: err.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const OptionCard = ({ label, value, current, onChange }: { label: string; value: string; current: string; onChange: (v: string) => void }) => {
        const isSelected = current === value;
        return (
            <div onClick={() => onChange(value)} className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${isSelected ? "border-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(255,0,0,0.1)]" : "border-border hover:border-primary/50"}`}>
                <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`font-medium text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>{label}</span>
                </div>
            </div>
        );
    };

    const allSteps = flowType === "direct"
        ? ["Trigger", "Post", "Keyword", "Alur", "Pesan DM"]
        : ["Trigger", "Post", "Keyword", "Alur", "Opening", "Followup", "Ending"];

    const totalStepsNum = flowType === "direct" ? 5 : 7;

    return (
        <div className="mb-8 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Wizard Header */}
            <div className="border-b border-border bg-secondary/20 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Buat Automation Baru</h3>
                    <span className="text-sm font-medium text-muted-foreground">Langkah {step} dari {totalStepsNum}</span>
                </div>
                <div className="flex items-center gap-1">
                    {allSteps.map((label, i) => {
                        const stepNum = i + 1;
                        const isSkipped = (stepNum === 2 || stepNum === 4) && triggerSource && triggerSource !== "komentar_ig_fb";
                        const isCompleted = stepNum < step;
                        const isActive = stepNum === step;
                        return (
                            <div key={label} className={`flex items-center flex-1 gap-1 ${isSkipped ? "opacity-30 grayscale" : ""}`}>
                                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${isActive ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : isCompleted ? "bg-primary text-white" : "bg-border text-muted-foreground"}`}>
                                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : stepNum}
                                </div>
                                <span className={`text-[10px] hidden sm:block transition-colors ${isActive ? "text-primary font-bold" : isCompleted ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</span>
                                {i < allSteps.length - 1 && (
                                    <div className={`flex-1 h-0.5 rounded-full transition-all ${isCompleted ? "bg-primary" : "bg-border"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2-column layout: Form + Phone Preview */}
            <div className="flex flex-col md:flex-row min-h-[400px]">
                {/* ── LEFT: Form ── */}
                <div className="flex-1 p-6 border-r border-border">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: TRIGGER SOURCE */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h4 className="text-lg font-medium text-foreground mb-4">Mau Trigger dari mana?</h4>
                                <div className="flex flex-col gap-3">
                                    <OptionCard label="💬 Komentar IG / Facebook" value="komentar_ig_fb" current={triggerSource} onChange={setTriggerSource} />
                                    <OptionCard label="📸 Story Reply IG / Facebook" value="story_ig_fb" current={triggerSource} onChange={setTriggerSource} />
                                    <OptionCard label="📩 Chat (DM Langsung)" value="chat_ig_fb" current={triggerSource} onChange={setTriggerSource} />
                                </div>
                                {triggerSource && (
                                    <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
                                        {triggerSource === "komentar_ig_fb" && "Bot memantau komentar di postingan Anda dan mengirimkan DM otomatis."}
                                        {triggerSource === "story_ig_fb" && "Bot membalas otomatis setiap ada yang me-reply Story Anda."}
                                        {triggerSource === "chat_ig_fb" && "Bot membalas otomatis setiap ada pesan masuk yang mengandung keyword tertentu."}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 2: TARGET POST (ONLY FOR KOMENTAR) */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h4 className="text-lg font-medium text-foreground mb-4">Post mana yang mau dipakai?</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <OptionCard
                                        label="📋 Semua Postingan (any post or reel)"
                                        value="semua_post"
                                        current={targetPost}
                                        onChange={(v) => { setTargetPost(v); setSelectedPost(null); setShowPostPicker(false); }}
                                    />
                                    <div
                                        onClick={() => {
                                            setTargetPost("post_tertentu");
                                            setShowPostPicker(true);
                                            if (igPosts.length === 0) fetchIgPosts();
                                        }}
                                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${targetPost === "post_tertentu" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                                    >
                                        <div
                                            className="flex items-center gap-3 mb-2 w-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTargetPost("post_tertentu");
                                                setShowPostPicker(true);
                                                if (igPosts.length === 0) fetchIgPosts();
                                            }}
                                        >
                                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${targetPost === "post_tertentu" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                                                {targetPost === "post_tertentu" && <CheckCircle2 className="h-3 w-3 text-white" />}
                                            </div>
                                            <span className={`font-medium text-sm ${targetPost === "post_tertentu" ? "text-primary" : "text-foreground"}`}>
                                                🎯 Pilih Post Tertentu (IG Reels/Feeds)
                                            </span>
                                        </div>

                                        {/* Post Picker Grid */}
                                        {showPostPicker && (
                                            <div className="mt-3" onClick={e => e.stopPropagation()}>
                                                {isLoadingPosts ? (
                                                    <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                        <span className="text-sm">Memuat postingan...</span>
                                                    </div>
                                                ) : igPosts.length === 0 ? (
                                                    <div className="text-center py-6 space-y-2">
                                                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                                                        <p className="text-sm font-medium text-foreground">Instagram belum terhubung atau tidak ada postingan.</p>
                                                        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg text-left overflow-hidden break-all font-mono space-y-1 mt-2">
                                                            <div className="font-semibold text-primary mb-1 border-b pb-1">Debug API Meta:</div>
                                                            <div>ID Tersimpan: <span className="text-yellow-400">{metaInstagramId || "(kosong)"}</span></div>
                                                            <div>ID Instagram: {metaInstagramId ? <span className="text-green-500">Terdaftar</span> : <span className="text-destructive">Kosong (Belum Connect)</span>}</div>
                                                            <div>Akses Token: {metaAccessToken ? <span className="text-green-500">Tersimpan</span> : <span className="text-destructive">Kosong (Belum Connect)</span>}</div>
                                                            {(!metaInstagramId || !metaAccessToken) && (
                                                                <div className="text-amber-500 mt-2">Pastikan "Meta Terhubung" berstatus hijau di Dashboard.</div>
                                                            )}
                                                            {metaInstagramId && (
                                                                <div className="text-amber-400 mt-2">⚠️ Jika 404: ID mungkin adalah FB Page ID, bukan IG ID. Coba Disconnect &amp; Connect Meta ulang.</div>
                                                            )}
                                                        </div>
                                                        <Button size="sm" variant="outline" onClick={fetchIgPosts} className="mt-4">
                                                            <RefreshCw className="h-3 w-3 mr-1" /> COBA LAGI API DEBUG
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                                        {igPosts.map(post => {
                                                            const thumb = post.thumbnail_url || post.media_url;
                                                            const isSelected = selectedPost?.id === post.id;
                                                            return (
                                                                <div
                                                                    key={post.id}
                                                                    onClick={() => setSelectedPost(post)}
                                                                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? "border-primary scale-105 shadow-lg shadow-primary/20" : "border-transparent hover:border-primary/50"}`}
                                                                >
                                                                    {thumb ? (
                                                                        <img src={thumb} alt={post.caption || "post"} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-[#2c2c2e] flex items-center justify-center">
                                                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                                        </div>
                                                                    )}
                                                                    {isSelected && (
                                                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                                                        </div>
                                                                    )}
                                                                    {/* Badge for type */}
                                                                    <div className="absolute top-1 right-1 text-[8px]">
                                                                        {post.media_type === "VIDEO" && "🎬"}
                                                                        {post.media_type === "CAROUSEL_ALBUM" && "🖼️"}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {selectedPost && (
                                                    <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Post dipilih: {selectedPost.caption?.slice(0, 30) || selectedPost.id}...
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 & 4 (MERGED): KEYWORD & COMMENTS */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                {/* Trigger Keyword Setup */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-medium text-foreground mb-1">Kondisi (Trigger)</h4>

                                    <div className="rounded-xl border border-input bg-secondary/10 p-3 flex flex-col gap-2">
                                        <label className="flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-secondary/30 transition-colors">
                                            <input type="radio" className="h-4 w-4 text-primary" name="keyword_type" checked={!isAnyWord} onChange={() => setIsAnyWord(false)} />
                                            <span className="text-sm font-medium">a specific word or words</span>
                                        </label>

                                        {!isAnyWord && (
                                            <div className="pl-9 pr-2 pb-2">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder="Contoh: Mau, Info, Harga, Link"
                                                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    value={keyword}
                                                    onChange={e => setKeyword(e.target.value)}
                                                />
                                                <p className="text-[11px] text-muted-foreground mt-2">Pisahkan dengan koma untuk beberapa kata kunci.</p>
                                            </div>
                                        )}

                                        <label className="flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-secondary/30 transition-colors">
                                            <input type="radio" className="h-4 w-4 text-primary" name="keyword_type" checked={isAnyWord} onChange={() => setIsAnyWord(true)} />
                                            <span className="text-sm font-medium flex items-center gap-2">
                                                any word
                                                <div className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded flex items-center justify-center font-bold">PRO</div>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Comments Settings (Only if trigger_source is komentar_ig_fb) */}
                                {triggerSource === "komentar_ig_fb" && (
                                    <div className="rounded-xl border border-input bg-secondary/10 p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-foreground cursor-pointer">reply to their comments under the post</label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={enableCommentReply} onChange={e => setEnableCommentReply(e.target.checked)} />
                                                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        {enableCommentReply && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                                                {commentReplies.map((reply, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder={i === 0 ? "Thanks! Please see DMs." : i === 1 ? "Sent you a message! Check it out!" : "Nice! Check your DMs!"}
                                                            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                            value={reply}
                                                            onChange={e => {
                                                                const updated = [...commentReplies];
                                                                updated[i] = e.target.value;
                                                                setCommentReplies(updated);
                                                            }}
                                                        />
                                                        {commentReplies.length > 1 && (
                                                            <button onClick={() => setCommentReplies(commentReplies.filter((_, j) => j !== i))} className="text-destructive text-xs hover:opacity-70 p-2">✕</button>
                                                        )}
                                                    </div>
                                                ))}
                                                {commentReplies.length < 3 && (
                                                    <button onClick={() => setCommentReplies([...commentReplies, ""])} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                                                        + Add comment reply variation
                                                    </button>
                                                )}
                                                <p className="text-[11px] text-muted-foreground mt-2">Bot akan membalas dengan salah satu pesan tersebut secara acak ke komentar followers.</p>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 4: FLOW CHOICE */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h4 className="text-lg font-medium text-foreground mb-4">Pilih Aliran Chat</h4>
                                <div className="flex flex-col gap-3">
                                    <div
                                        onClick={() => { setFlowType("direct"); setIsFollowerOnly(false); }}
                                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${flowType === "direct" ? "border-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(255,0,0,0.1)]" : "border-border hover:border-primary/50"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${flowType === "direct" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                                                {flowType === "direct" && <CheckCircle2 className="h-3 w-3 text-white" />}
                                            </div>
                                            <div>
                                                <span className={`font-bold text-sm block ${flowType === "direct" ? "text-primary" : "text-foreground"}`}>A. Simpel Kirim URL</span>
                                                <p className="text-[10px] text-muted-foreground">Kirim teks salam + 1 tombol website (Selesai).</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => { setFlowType("sequence"); setIsFollowerOnly(false); }}
                                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${flowType === "sequence" && !isFollowerOnly ? "border-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(255,0,0,0.1)]" : "border-border hover:border-primary/50"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${flowType === "sequence" && !isFollowerOnly ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                                                {flowType === "sequence" && !isFollowerOnly && <CheckCircle2 className="h-3 w-3 text-white" />}
                                            </div>
                                            <div>
                                                <span className={`font-bold text-sm block ${flowType === "sequence" && !isFollowerOnly ? "text-primary" : "text-foreground"}`}>B. Sequence 3 Step</span>
                                                <p className="text-[10px] text-muted-foreground">Flow interaktif (Pilihan &rarr; Detail &rarr; Link Website).</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => {
                                            setFlowType("sequence");
                                            setIsFollowerOnly(true);
                                            // Enable comment reply by default
                                            setEnableCommentReply(true);
                                            // Auto-fill Step 4 (Opening DM)
                                            setStep4Text("Halo Kak maukah pdf gratis kita?");
                                            setStep4BtnType("quick_reply");
                                            setStep4Buttons([{ title: "Mau", url: "" }]);
                                            setStep4Button1LeadsTo("step5");
                                            // Auto-fill Step 5 (Verification block)
                                            setStep5Text("Udah follow aku kan kak ? biar otomatis terkirim Link nya");
                                            setStep5BtnType("quick_reply");
                                            setStep5Buttons([
                                                { title: "Udah Follow", url: "" },
                                                { title: "Belum Follow", url: "" }
                                            ]);
                                            setStep5Button1LeadsTo("step6");
                                            setStep5Button2LeadsTo("repeat_step5");
                                            // Auto-fill Step 6 (Final Link)
                                            setStep6Text("Makasih kak udah follow ini dia Link nya silahkan buka 🚀");
                                            setStep6UrlTitle("Klik Disini");
                                            setStep6UrlLink(""); // Leave empty for user to fill
                                        }}
                                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${flowType === "sequence" && isFollowerOnly ? "border-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(255,0,0,0.1)]" : "border-border hover:border-primary/50"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${flowType === "sequence" && isFollowerOnly ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                                                {flowType === "sequence" && isFollowerOnly && <CheckCircle2 className="h-3 w-3 text-white" />}
                                            </div>
                                            <div>
                                                <span className={`font-bold text-sm block ${flowType === "sequence" && isFollowerOnly ? "text-primary" : "text-foreground"}`}>C. Ajak Follower Only</span>
                                                <p className="text-[10px] text-muted-foreground">Otomatis cek & wajibkan follow sebelum link akhir.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: Opening DM (Previously Step 4) */}
                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <h4 className="text-lg font-medium text-foreground mb-1">{flowType === "direct" ? "Konfigurasi Pesan" : "Langkah 1: Opening DM"}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{flowType === "direct" ? "Pesan ini akan dikirim dengan tombol URL." : "Pesan pertama yang akan diterima user."}</p>

                                <div>
                                    <textarea
                                        placeholder="Contoh: Halo kak! Mau info produk kita?"
                                        className="w-full min-h-[100px] rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={step4Text}
                                        onChange={e => setStep4Text(e.target.value)}
                                    />
                                </div>

                                <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-4 mt-4">
                                    <h5 className="text-sm font-semibold text-foreground mb-1">
                                        {flowType === "direct" ? "Tombol Website" : "Tipe Tombol (Maksimal 2)"}
                                    </h5>

                                    {flowType === "sequence" && (
                                        <div className="flex items-center gap-4 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" className="h-4 w-4 text-primary" checked={step4BtnType === "quick_reply"} onChange={() => setStep4BtnType("quick_reply")} />
                                                <span className="text-sm font-medium">Quick Replies</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" className="h-4 w-4 text-primary" checked={step4BtnType === "web_url"} onChange={() => setStep4BtnType("web_url")} />
                                                <span className="text-sm font-medium">Website URL</span>
                                            </label>
                                        </div>
                                    )}

                                    <div className="h-px bg-border my-2" />

                                    {flowType === "direct" ? (
                                        <div className="flex gap-2 items-center mb-2">
                                            <input
                                                type="text"
                                                placeholder="Judul Tombol"
                                                value={step4Buttons[0].title}
                                                onChange={e => { const newB = [...step4Buttons]; newB[0].title = e.target.value; setStep4Buttons(newB); }}
                                                className="flex-1 rounded-xl border border-input px-3 py-2 text-sm focus:ring-primary"
                                            />
                                            <input
                                                type="url"
                                                placeholder="https://..."
                                                value={step4Buttons[0].url}
                                                onChange={e => { const newB = [...step4Buttons]; newB[0].url = e.target.value; setStep4Buttons(newB); }}
                                                className="flex-1 rounded-xl border border-input px-3 py-2 text-sm focus:ring-primary"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            {step4Buttons.map((btn, i) => (
                                                <div key={i} className="flex flex-col gap-1 mb-3">
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="text"
                                                            placeholder={step4BtnType === "quick_reply" ? "Tombol Quick Reply (Maks 20 char)" : "Judul Tombol"}
                                                            maxLength={step4BtnType === "quick_reply" ? 20 : 50}
                                                            value={btn.title}
                                                            onChange={e => { const newB = [...step4Buttons]; newB[i].title = e.target.value; setStep4Buttons(newB); }}
                                                            className="flex-1 rounded-xl border border-input px-3 py-2 text-sm focus:ring-primary"
                                                        />
                                                        {step4BtnType === "web_url" && (
                                                            <input
                                                                type="url"
                                                                placeholder="https://..."
                                                                value={btn.url}
                                                                onChange={e => { const newB = [...step4Buttons]; newB[i].url = e.target.value; setStep4Buttons(newB); }}
                                                                className="flex-1 rounded-xl border border-input px-3 py-2 text-sm focus:ring-primary"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* NEW BRANCHING UI FOR STEP 4 */}
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-xs text-muted-foreground self-center">Tombol {i === 0 ? 'A' : 'B'} lanjut ke &rarr;</span>
                                                        {(["step5", "step6"] as const).filter(opt => !isFollowerOnly || opt !== "step6").map(opt => {
                                                            const currentLead = i === 0 ? step4Button1LeadsTo : step4Button2LeadsTo;
                                                            const setter = i === 0 ? setStep4Button1LeadsTo : setStep4Button2LeadsTo;
                                                            return (
                                                                <button key={opt} type="button"
                                                                    onClick={() => setter(opt)}
                                                                    className={`text-xs px-2 py-1 rounded border transition-colors ${currentLead === opt ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"}`}>
                                                                    {opt === "step5" ? "Step 5 (lanjut)" : "Step 6 (final)"}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                            {step4Buttons.length < 2 && (
                                                <button onClick={() => setStep4Buttons([...step4Buttons, { title: "", url: "" }])} className="text-primary text-xs font-semibold">+ Tambah Tombol</button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 6: Followup (Previously Step 5) */}
                        {step === 6 && flowType === "sequence" && (
                            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <h4 className="text-lg font-medium text-foreground mb-1">Langkah 2: Follow-up DM</h4>
                                <p className="text-sm text-muted-foreground mb-3">Balasan jika user mengeklik pilihan di Opening DM.</p>

                                <div>
                                    <textarea
                                        placeholder="Contoh: Baik, ini detail harganya."
                                        className="w-full min-h-[100px] rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={step5Text}
                                        onChange={e => setStep5Text(e.target.value)}
                                    />
                                </div>

                                {isFollowerOnly && (
                                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 mt-2">
                                        <p className="text-xs text-primary font-medium flex items-center gap-2">
                                            🛡️ Auto-verifikasi Follow
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Saat user klik tombol yang menuju Step 6, sistem akan cek dulu apakah mereka benar-benar sudah follow. Jika belum, pesan ini akan diulang otomatis.
                                        </p>
                                    </div>
                                )}

                                <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-4 mt-4">
                                    <h5 className="text-sm font-semibold text-foreground mb-1">Tipe Tombol (Maksimal 2)</h5>
                                    <div className="flex items-center gap-4 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" className="h-4 w-4 text-primary" checked={step5BtnType === "quick_reply"} onChange={() => setStep5BtnType("quick_reply")} />
                                            <span className="text-sm font-medium">Quick Replies</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" className="h-4 w-4 text-primary" checked={step5BtnType === "web_url"} onChange={() => setStep5BtnType("web_url")} />
                                            <span className="text-sm font-medium">Website URL</span>
                                        </label>
                                    </div>
                                    <div className="h-px bg-border my-2" />

                                    {step5Buttons.map((btn, i) => (
                                        <div key={i} className="flex flex-col gap-1 mb-3">
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    placeholder={step5BtnType === "quick_reply" ? "Tombol Quick Reply (Maks 20 char)" : "Judul Tombol"}
                                                    maxLength={step5BtnType === "quick_reply" ? 20 : 50}
                                                    value={btn.title}
                                                    onChange={e => { const newB = [...step5Buttons]; newB[i].title = e.target.value; setStep5Buttons(newB); }}
                                                    className="flex-1 rounded-xl border border-input px-3 py-2 text-sm focus:ring-primary"
                                                />
                                                {step5BtnType === "web_url" && (
                                                    <input
                                                        type="url"
                                                        placeholder="https://..."
                                                        value={btn.url}
                                                        onChange={e => { const newB = [...step5Buttons]; newB[i].url = e.target.value; setStep5Buttons(newB); }}
                                                        className="flex-1 rounded-xl border border-input px-3 py-2 text-sm focus:ring-primary"
                                                    />
                                                )}
                                            </div>

                                            {/* NEW BRANCHING UI FOR STEP 5 */}
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground self-center">Tombol {i === 0 ? 'A' : 'B'} lanjut ke &rarr;</span>
                                                {(["step6", "repeat_step5"] as const).map(opt => {
                                                    const currentLead = i === 0 ? step5Button1LeadsTo : step5Button2LeadsTo;
                                                    const setter = i === 0 ? setStep5Button1LeadsTo : setStep5Button2LeadsTo;
                                                    return (
                                                        <button key={opt} type="button"
                                                            onClick={() => setter(opt)}
                                                            className={`text-xs px-2 py-1 rounded border transition-colors ${currentLead === opt ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"}`}>
                                                            {opt === "step6" ? "Step 6 (final)" : "🔁 Ulangi Step 5"}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    {step5Buttons.length < 2 && (
                                        <button onClick={() => setStep5Buttons([...step5Buttons, { title: "", url: "" }])} className="text-primary text-xs font-semibold">+ Tambah Tombol</button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 7: Final Ending (Previously Step 6) */}
                        {step === 7 && flowType === "sequence" && (
                            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <h4 className="text-lg font-medium text-foreground mb-1">Langkah 3: Ending Link</h4>
                                <p className="text-sm text-muted-foreground mb-3">Teks terakhir dan sebuah link website (maks 1 tombol).</p>

                                <div>
                                    <textarea
                                        placeholder="Contoh: Silakan selesaikan pesanan Anda di website kami ya!"
                                        className="w-full min-h-[100px] rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={step6Text}
                                        onChange={e => setStep6Text(e.target.value)}
                                    />
                                </div>

                                <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-4 mt-4">
                                    <h5 className="text-sm font-semibold text-foreground mb-1">Tombol Website</h5>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Judul Tombol (Ex: Beli Sekarang)"
                                            value={step6UrlTitle}
                                            onChange={e => setStep6UrlTitle(e.target.value)}
                                            className="flex-1 rounded-xl border border-input px-3 py-2 text-sm focus:ring-primary"
                                        />
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={step6UrlLink}
                                            onChange={e => setStep6UrlLink(e.target.value)}
                                            className="flex-1 rounded-xl border border-input px-3 py-2 text-sm focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* ── RIGHT: Phone Preview ── */}
                <div className="w-full md:w-[320px] shrink-0 bg-secondary/10 p-6 flex flex-col items-center border-t md:border-t-0 md:border-l border-border relative">
                    <div className="md:sticky md:top-6 w-full flex justify-center">
                        <PhonePreview
                            step={step}
                            flowType={flowType}
                            keyword={keyword}
                            isAnyWord={isAnyWord}
                            commentReplies={commentReplies}
                            enableCommentReply={enableCommentReply}
                            triggerSource={triggerSource}
                            selectedPost={selectedPost}

                            step4Text={step4Text}
                            step4BtnType={step4BtnType}
                            step4Buttons={step4Buttons}

                            step5Text={step5Text}
                            step5BtnType={step5BtnType}
                            step5Buttons={step5Buttons}

                            step6Text={step6Text}
                            step6UrlTitle={step6UrlTitle}
                            step6UrlLink={step6UrlLink}
                        />
                    </div>
                </div>
            </div>

            {/* Footer / Navigation */}
            <div className="border-t border-border bg-background px-6 py-4 flex items-center justify-between">
                <Button variant="ghost" onClick={step === 1 ? onCancel : handleBack} disabled={isSaving}>
                    {step === 1 ? "Batal" : <><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</>}
                </Button>

                {(step < totalStepsNum && !(step === 5 && flowType === "direct")) ? (
                    <Button onClick={handleNext} className="min-w-[120px] shadow-lg shadow-primary/20">
                        Lanjut <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSave} disabled={isSaving} className="min-w-[140px] shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "✅ Simpan Trigger"}
                    </Button>
                )}
            </div>
        </div >
    );
};
