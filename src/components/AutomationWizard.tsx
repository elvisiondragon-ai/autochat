import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, Heart, Send, ImageIcon, RefreshCw } from "lucide-react";

export interface AutomationWizardProps {
    userId: string;
    metaInstagramId?: string | null;
    metaAccessToken?: string | null;
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
const PhonePreview = ({ step, keyword, commentReply, dmReply, triggerSource, sequenceType, directUrl, selectedPost, buttonText, buttonUrl }: {
    step: number;
    keyword: string;
    commentReply: string;
    dmReply: string;
    triggerSource: string;
    sequenceType: string;
    directUrl: string;
    selectedPost?: IgMedia | null;
    buttonText: string;
    buttonUrl: string;
}) => {
    const isDM = triggerSource === "chat_ig_fb" || step >= 5;
    const showDMPreview = step >= 6 && dmReply.trim() !== "";
    const showFollowCheck = step === 5 && sequenceType === "follow_check";
    const showCommentPreview = step === 4 && commentReply.trim() !== "";
    const showKeyword = step >= 3 && keyword.trim() !== "";
    const postThumbnail = selectedPost?.thumbnail_url || selectedPost?.media_url;

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
                    <div className="flex-1 overflow-hidden p-3 flex flex-col gap-2">
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
                                            <span className="text-[#adadad] text-[9px]">{commentReply}</span>
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
                                            <span className="text-white text-[9px]">{keyword || "user message"}</span>
                                        </div>
                                    </motion.div>
                                )}
                                {showDMPreview && (
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="flex items-end gap-1">
                                        <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shrink-0 flex items-center justify-center text-[6px] font-bold text-white">🤖</div>
                                        <div className="max-w-[140px]">
                                            <div className="rounded-2xl rounded-bl-sm bg-[#2c2c2e] overflow-hidden">
                                                <div className="px-3 py-1.5">
                                                    <span className="text-white text-[9px]">{dmReply}</span>
                                                </div>
                                                {buttonText.trim() && (
                                                    <div className="px-2 pb-2 pt-1">
                                                        <div className="rounded-lg bg-[#0095f6] px-3 py-1.5 text-center">
                                                            <span className="text-[9px] text-white font-bold">{buttonText}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {/* Follow check preview at step 5 */}
                                {step === 5 && (
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="flex items-end gap-1">
                                        <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shrink-0 flex items-center justify-center text-[6px] font-bold text-white">🤖</div>
                                        <div className="max-w-[140px]">
                                            <div className="rounded-2xl rounded-bl-sm bg-[#2c2c2e] overflow-hidden">
                                                <div className="px-3 py-1.5">
                                                    <span className="text-white text-[9px]">Follow aku dulu dong biar ku kasih Link Nya! 🔒</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <div className="rounded-xl bg-[#0095f6] px-2 py-1 text-center text-[8px] text-white font-semibold">✅ Aku Sudah Follow</div>
                                                <div className="rounded-xl bg-[#2c2c2e] border border-[#adadad]/30 px-2 py-1 text-center text-[8px] text-[#adadad]">❌ Belum Follow</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
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
                    {step === 4 && "Balasan di komentar"}
                    {step === 5 && "Cek Follow Dulu?"}
                    {step === 6 && "Preview DM & Link"}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Live Preview</p>
            </div>
        </div>
    );
};


// ── Main Wizard Component ─────────────────────────────────────────────────────
export const AutomationWizard: React.FC<AutomationWizardProps> = ({ userId, metaInstagramId, metaAccessToken, onSuccess, onCancel }) => {
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [targetPost, setTargetPost] = useState<string>("");
    const [selectedPost, setSelectedPost] = useState<IgMedia | null>(null);
    const [showPostPicker, setShowPostPicker] = useState(false);
    const [triggerSource, setTriggerSource] = useState<string>("");
    const [keyword, setKeyword] = useState<string>("");
    const [commentReply, setCommentReply] = useState<string>("");
    const [dmReply, setDmReply] = useState<string>("");
    const [sequenceType, setSequenceType] = useState<string>("");
    const [directUrl, setDirectUrl] = useState<string>("");
    const [buttonText, setButtonText] = useState<string>("");
    const [buttonUrl, setButtonUrl] = useState<string>("");

    // IG Posts State
    const [igPosts, setIgPosts] = useState<IgMedia[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);

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
            if (!keyword.trim()) return toast({ description: "Keyword tidak boleh kosong", variant: "destructive" });
            if (triggerSource !== "komentar_ig_fb") { setStep(5); return; }
        }
        if (step === 6) {
            if (!dmReply.trim()) return toast({ description: "Pesan DM wajib diisi", variant: "destructive" });
            if (!buttonText.trim()) return toast({ description: "Nama Tombol wajib diisi", variant: "destructive" });
            if (!buttonUrl.trim()) return toast({ description: "URL Link wajib diisi", variant: "destructive" });
        }
        if (step < 6) setStep(step + 1);
    };

    const handleBack = () => {
        if (step === 3 && triggerSource !== "komentar_ig_fb") { setStep(1); return; }
        if (step === 5 && triggerSource !== "komentar_ig_fb") { setStep(3); return; }
        if (step > 1) setStep(step - 1);
    };

    const handleSave = async () => {
        if (!dmReply.trim()) {
            return toast({ description: "Balasan DM tidak boleh kosong", variant: "destructive" });
        }
        if (!buttonText.trim() || !buttonUrl.trim()) {
            return toast({ description: "Nama Tombol dan URL Link wajib diisi", variant: "destructive" });
        }
        setIsSaving(true);
        try {
            let btn1Text = null, btn1Url = null, btn2Text = null, btn2Url = null;
            if (buttonText.trim() && buttonUrl.trim()) {
                btn1Text = buttonText; btn1Url = buttonUrl;
            } else if (sequenceType === "direct_url" && directUrl) {
                btn1Text = "Klik Disini"; btn1Url = directUrl;
            }
            if (sequenceType === "follow_check") {
                btn1Text = "✅ Aku Sudah Follow";
                btn1Url = buttonUrl || "https://your-product-link.com";
                btn2Text = "❌ Belum Follow";
                btn2Url = "https://instagram.com";
            }

            const payload = {
                user_id: userId,
                // Store IG post ID when a specific post is chosen
                target_post: selectedPost ? selectedPost.id : (triggerSource === "komentar_ig_fb" ? targetPost : "any_post"),
                trigger_source: triggerSource,
                keyword,
                comment_reply: (triggerSource === "komentar_ig_fb" && commentReply) ? commentReply : null,
                reply_message: dmReply,
                sequence_type: sequenceType,
                button_text: btn1Text,
                button_url: btn1Url,
                button_text_2: btn2Text,
                button_url_2: btn2Url,
                is_active: true
            };

            const { error } = await supabase.from("autochat_triggers").insert(payload);
            if (error) throw error;

            toast({ title: "Automation Berhasil Dibuat! 🎉", description: `Keyword "${keyword}" aktif.` });
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

    const allSteps = ["Trigger", "Post", "Keyword", "Komen", "Follow?", "DM & Link"];

    return (
        <div className="mb-8 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Wizard Header */}
            <div className="border-b border-border bg-secondary/20 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Buat Automation Baru</h3>
                    <span className="text-sm font-medium text-muted-foreground">Langkah {step} dari 6</span>
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

                        {/* STEP 3: KEYWORD */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h4 className="text-lg font-medium text-foreground mb-1">Kata kunci (Keyword)</h4>
                                <p className="text-sm text-muted-foreground mb-4">Follower harus mengetik kata ini agar bot membalas.</p>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Contoh: Mau, Info, Harga, Link"
                                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleNext()}
                                />
                                <p className="text-xs text-muted-foreground">Pisahkan dengan koma untuk beberapa kata kunci. Contoh: <span className="font-semibold text-foreground italic">Price, Link, Shop</span></p>
                            </motion.div>
                        )}

                        {/* STEP 4: KOMEN (ONLY FOR KOMENTAR) */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h4 className="text-lg font-medium text-foreground mb-1">Balas di komentar (Opsional)</h4>
                                <p className="text-sm text-muted-foreground mb-4">Balasan publik di kolom komentar mereka.</p>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Contoh: Oke kak sudah aku kirim ke DM ya!"
                                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={commentReply}
                                    onChange={e => setCommentReply(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleNext()}
                                />
                            </motion.div>
                        )}

                        {/* STEP 5: FOLLOW CHECK */}
                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <h4 className="text-lg font-medium text-foreground mb-1">Cek Follow Dulu? 🔒</h4>
                                <p className="text-sm text-muted-foreground mb-4">Apakah kamu ingin memastikan user sudah Follow akunmu sebelum mendapatkan link?</p>
                                <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-3">
                                    <OptionCard
                                        label="A. ✅ Ya — Pastikan user sudah Follow dulu"
                                        value="follow_check"
                                        current={sequenceType}
                                        onChange={(v) => setSequenceType(sequenceType === v ? "" : v)}
                                    />
                                    <OptionCard
                                        label="B. ❌ Tidak — Langsung kasih link tanpa cek Follow"
                                        value="no_follow_check"
                                        current={sequenceType}
                                        onChange={(v) => setSequenceType(sequenceType === v ? "" : v)}
                                    />
                                    {sequenceType === "follow_check" && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                                            <div className="rounded-xl bg-muted/50 p-3 space-y-2">
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Jika user <span className="text-foreground font-semibold">belum Follow</span>, Bot akan kirim:
                                                </p>
                                                <div className="rounded-lg bg-background border border-border p-3">
                                                    <p className="text-sm text-foreground italic">"Follow aku dulu dong biar ku kasih Link Nya!"</p>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <div className="flex-1 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-center text-xs font-semibold text-primary">
                                                        ✅ Aku Sudah Follow
                                                    </div>
                                                    <div className="flex-1 rounded-xl border border-border bg-muted px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                                                        ❌ Belum Follow
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 6: DM REPLY + BUTTON (mandatory) */}
                        {step === 6 && (
                            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                {/* Part A: Pesan DM */}
                                <div>
                                    <h4 className="text-lg font-medium text-foreground mb-1">Pesan DM otomatis</h4>
                                    <p className="text-sm text-muted-foreground mb-3">Pesan ini akan masuk ke inbox/DM mereka secara otomatis.</p>
                                    <textarea
                                        autoFocus
                                        placeholder="Contoh: Hai kak! Makasih udah komen ya 😊 Ini aku kirimin link-nya langsung..."
                                        className="w-full min-h-[100px] rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={dmReply}
                                        onChange={e => setDmReply(e.target.value)}
                                    />
                                </div>

                                {/* Part B: Isi Tombol (Wajib) */}
                                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                                    <h5 className="text-sm font-semibold text-foreground">🔗 Isi Tombol <span className="text-destructive">*Wajib</span></h5>
                                    <p className="text-xs text-muted-foreground">Tombol akan muncul di bawah pesan DM. Lihat preview di samping →</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nama Tombol <span className="text-destructive">*</span></label>
                                            <input
                                                type="text"
                                                placeholder="Contoh: Lihat Produk"
                                                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                value={buttonText}
                                                onChange={e => setButtonText(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">URL Link <span className="text-destructive">*</span></label>
                                            <input
                                                type="url"
                                                placeholder="https://elvisiongroup.com"
                                                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                value={buttonUrl}
                                                onChange={e => setButtonUrl(e.target.value)}
                                            />
                                        </div>
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
                            keyword={keyword}
                            commentReply={commentReply}
                            dmReply={dmReply}
                            triggerSource={triggerSource}
                            sequenceType={sequenceType}
                            directUrl={directUrl}
                            selectedPost={selectedPost}
                            buttonText={buttonText}
                            buttonUrl={buttonUrl}
                        />
                    </div>
                </div>
            </div>

            {/* Footer / Navigation */}
            <div className="border-t border-border bg-background px-6 py-4 flex items-center justify-between">
                <Button variant="ghost" onClick={step === 1 ? onCancel : handleBack} disabled={isSaving}>
                    {step === 1 ? "Batal" : <><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</>}
                </Button>

                {step < 6 ? (
                    <Button onClick={handleNext} className="min-w-[120px] shadow-lg shadow-primary/20">
                        Lanjut <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSave} disabled={isSaving} className="min-w-[140px] shadow-lg shadow-primary/20">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "✅ Simpan Trigger"}
                    </Button>
                )}
            </div>
        </div>
    );
};
