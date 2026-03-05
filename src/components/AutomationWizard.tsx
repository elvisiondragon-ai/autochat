import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export interface AutomationWizardProps {
    userId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AutomationWizard: React.FC<AutomationWizardProps> = ({ userId, onSuccess, onCancel }) => {
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [targetPost, setTargetPost] = useState<string>("");
    const [triggerSource, setTriggerSource] = useState<string>("");
    const [keyword, setKeyword] = useState<string>("");
    const [commentReply, setCommentReply] = useState<string>("");
    const [dmReply, setDmReply] = useState<string>("");
    const [sequenceType, setSequenceType] = useState<string>("");
    const [directUrl, setDirectUrl] = useState<string>("");

    const handleNext = () => {
        // Basic validation before moving to next step
        if (step === 1 && !targetPost) return toast({ description: "Pilih Post terlebih dahulu", variant: "destructive" });
        if (step === 2 && !triggerSource) return toast({ description: "Pilih sumber Trigger", variant: "destructive" });
        if (step === 3 && !keyword.trim()) return toast({ description: "Keyword tidak boleh kosong", variant: "destructive" });
        if (step === 5 && !dmReply.trim()) return toast({ description: "Balasan DM tidak boleh kosong", variant: "destructive" });

        // For step 6, handled by submit
        if (step < 6) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSave = async () => {
        // Final Validation
        if (sequenceType === "direct_url" && !directUrl) {
            return toast({ description: "URL wajib diisi", variant: "destructive" });
        }

        setIsSaving(true);
        try {
            // Map sequence choices to button fields
            let btn1Text = null, btn1Url = null;
            let btn2Text = null, btn2Url = null;

            if (sequenceType === "direct_url") {
                btn1Text = "Klik Disini";
                btn1Url = directUrl;
            } else if (sequenceType === "follow_check") {
                btn1Text = "Udah";
                btn1Url = "https://your-product-link.com"; // Placeholder or needs another input from user later based on preference
                btn2Text = "Belum (Follow Dulu)";
                btn2Url = "https://instagram.com/yourprofile"; // Placeholder
            }

            const payload = {
                user_id: userId,
                target_post: targetPost,
                trigger_source: triggerSource,
                keyword: keyword,
                comment_reply: commentReply || null,
                reply_message: dmReply,
                sequence_type: sequenceType,
                button_text: btn1Text,
                button_url: btn1Url,
                button_text_2: btn2Text,
                button_url_2: btn2Url,
                is_active: true
            };

            const { error } = await supabase.from("ig_triggers").insert(payload);
            if (error) throw error;

            toast({ title: "Automation Berhasil Dibuat! 🎉", description: `Keyword "${keyword}" aktif.` });
            onSuccess();
        } catch (err: any) {
            toast({ title: "Gagal menyimpan automation", description: err.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // Helper for generating selectable options quickly
    const OptionCard = ({ label, value, current, onChange }: { label: string, value: string, current: string, onChange: (v: string) => void }) => {
        const isSelected = current === value;
        return (
            <div
                onClick={() => onChange(value)}
                className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${isSelected ? "border-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(255,0,0,0.1)]" : "border-border hover:border-primary/50"
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>{label}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="mb-8 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Wizard Header / Progress */}
            <div className="border-b border-border bg-secondary/20 px-6 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Buat Automation Baru</h3>
                <span className="text-sm font-medium text-muted-foreground">Langkah {step} dari 6</span>
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">

                    {/* STEP 1 */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <h4 className="text-lg font-medium text-foreground mb-4">Pilih Tujuan Post?</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <OptionCard label="Semua Postingan" value="semua_post" current={targetPost} onChange={setTargetPost} />
                                <OptionCard label="Pilih Post Tertentu (IG Reels/Feeds)" value="post_tertentu" current={targetPost} onChange={setTargetPost} />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <h4 className="text-lg font-medium text-foreground mb-4">Mau Trigger dari mana?</h4>
                            <div className="flex flex-col gap-3">
                                <OptionCard label="Komentar IG dan Facebook" value="komentar_ig_fb" current={triggerSource} onChange={setTriggerSource} />
                                <OptionCard label="Story IG dan Facebook (Reply)" value="story_ig_fb" current={triggerSource} onChange={setTriggerSource} />
                                <OptionCard label="Chat IG dan Chat Facebook (DM Langsung)" value="chat_ig_fb" current={triggerSource} onChange={setTriggerSource} />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <h4 className="text-lg font-medium text-foreground mb-2">Apa Nih Triggernya? (Keyword)</h4>
                            <p className="text-sm text-muted-foreground mb-4">Kata kunci apa yang harus diketik follower agar bot membalas?</p>
                            <input
                                type="text"
                                autoFocus
                                placeholder="Contoh: Mau, Suka, Harga, Kirim"
                                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleNext()}
                            />
                        </motion.div>
                    )}

                    {/* STEP 4 */}
                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <h4 className="text-lg font-medium text-foreground mb-2">Balas di Komentarnya apa?</h4>
                            <p className="text-sm text-muted-foreground mb-4">Balasan publik yang akan tampil di kolom komentar mereka. (Opsional / Lewati jika dari Story/Chat)</p>
                            <input
                                type="text"
                                autoFocus
                                placeholder="Contoh: Oke kak sudah aku Kirim ke DM ya!"
                                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={commentReply}
                                onChange={e => setCommentReply(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleNext()}
                            />
                        </motion.div>
                    )}

                    {/* STEP 5 */}
                    {step === 5 && (
                        <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <h4 className="text-lg font-medium text-foreground mb-2">Balasan ke DM Customer pertama apa?</h4>
                            <p className="text-sm text-muted-foreground mb-4">Isi pesan yang akan masuk ke inbox/DM/Message mereka.</p>
                            <textarea
                                autoFocus
                                placeholder="Contoh: Hai kak aku terima komentar kamu, silahkan klik link dibawah ini ya"
                                className="w-full min-h-[120px] rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={dmReply}
                                onChange={e => setDmReply(e.target.value)}
                            />
                        </motion.div>
                    )}

                    {/* STEP 6 */}
                    {step === 6 && (
                        <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <h4 className="text-lg font-medium text-foreground mb-4">Setelah Diberi Pesan DM, arahnya kemana? (Actions)</h4>

                            <div className="space-y-4">
                                <OptionCard
                                    label="A. Langsung kirim tombol Link (URL)"
                                    value="direct_url"
                                    current={sequenceType}
                                    onChange={setSequenceType}
                                />

                                {sequenceType === "direct_url" && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pl-4">
                                        <label className="text-sm text-foreground mb-1 block">Masukkan URL / Link Kakak:</label>
                                        <input
                                            type="url"
                                            placeholder="Contoh: https://elvisiongroup.com"
                                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            value={directUrl}
                                            onChange={e => setDirectUrl(e.target.value)}
                                        />
                                    </motion.div>
                                )}

                                <OptionCard
                                    label="B. Lanjut Pilihan Jika (Sudah Follow / Belum Follow)"
                                    value="follow_check"
                                    current={sequenceType}
                                    onChange={setSequenceType}
                                />

                                {sequenceType === "follow_check" && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pl-4 border-l-2 border-primary/30 py-2">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Akan memunculkan opsi di DM customer:<br />
                                            <strong>• Udah Follow</strong> → Diberikan link bonus/website<br />
                                            <strong>• Belum Follow</strong> → Disuruh follow dulu
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer / Navigation */}
            <div className="border-t border-border bg-background px-6 py-4 flex items-center justify-between">
                <Button variant="ghost" onClick={step === 1 ? onCancel : handleBack} disabled={isSaving}>
                    {step === 1 ? "Batal" : <><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</>}
                </Button>

                {step < 6 ? (
                    <Button onClick={handleNext} className="min-w-[120px]">
                        Lanjut <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSave} disabled={!sequenceType || isSaving} className="min-w-[140px]">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Trigger"}
                    </Button>
                )}
            </div>
        </div>
    );
};
