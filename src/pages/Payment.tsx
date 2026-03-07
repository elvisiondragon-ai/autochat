import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CreditCard, Phone, User, Mail, Copy, Crown, Play, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';

export default function Payment() {
    const navigate = useNavigate();
    const { is_pro, user: sessionUser, client } = useAppContext();
    const [selectedPlan, setSelectedPlan] = useState('1_month');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('QRIS');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
    const { toast } = useToast();

    // Get current user info from context
    useEffect(() => {
        if (sessionUser) {
            setEmail(sessionUser.email || '');
            setFullName(client?.display_name || sessionUser.email?.split('@')[0] || '');
            setPhoneNumber(client?.phone_number || '');
        }
    }, [sessionUser, client]);

    // Redirect if already pro
    useEffect(() => {
        if (is_pro) {
            toast({
                title: "Anda sudah PRO!",
                description: "Terima kasih telah berlangganan.",
            });
            navigate('/dashboard');
        }
    }, [is_pro, navigate, toast]);

    const paymentMethods = [
        { code: 'QRIS', name: 'QRIS', description: 'DANA, OVO, ShopeePay, GoPay, dll' },
        { code: 'BCAVA', name: 'BCA Virtual Account', description: 'Transfer via BCA' },
        { code: 'MANDIRIVA', name: 'Mandiri Virtual Account', description: 'Transfer via Mandiri' },
        { code: 'BNIVA', name: 'BNI Virtual Account', description: 'Transfer via BNI' },
        { code: 'BRIVA', name: 'BRI Virtual Account', description: 'Transfer via BRI' }
    ];

    const subscriptionPlans = [
        {
            id: '1_month',
            name: 'PRO Bulanan',
            description: 'Akses penuh fitur Autochat PRO',
            price: 100000,
            duration: '30 hari'
        },
        {
            id: '1_year',
            name: 'PRO Tahunan (Hemat 20%)',
            description: 'Investasi terbaik untuk bisnis Anda',
            price: 800000,
            duration: '365 hari'
        }
    ];

    // Real-time payment status listener (listening for broadcast from trigger)
    useEffect(() => {
        if (!showPaymentInstructions || !paymentData?.tripay_reference) return;

        // We listen to the broadcast channel named after the tripay reference
        const channelName = `pro_subs_${paymentData.tripay_reference}`;
        const channel = supabase.channel(channelName);

        channel
            .on('broadcast', { event: 'pro_subscription_update' }, (response) => {
                console.log("[Payment] Received real-time update:", response);
                if (response.payload?.new?.status === 'active') {
                    toast({
                        title: "🎉 Pembayaran Berhasil!",
                        description: "Status PRO Anda telah aktif. Mengalihkan ke dashboard...",
                    });
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Payment] Subscribed to real-time channel: ${channelName}`);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [showPaymentInstructions, paymentData?.tripay_reference, toast, navigate]);

    const handleCreatePayment = async () => {
        if (!selectedPlan || !phoneNumber || !fullName || !email) {
            toast({
                title: "Data Tidak Lengkap",
                description: "Mohon lengkapi semua data profil.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const plan = subscriptionPlans.find(p => p.id === selectedPlan);

            const { data, error } = await supabase.functions.invoke('tripay-create-payment', {
                body: {
                    subscriptionType: plan?.id,
                    paymentMethod: selectedPaymentMethod,
                    userName: fullName,
                    userEmail: email,
                    phoneNumber: phoneNumber,
                    amount: plan?.price
                }
            });

            if (error) throw error;

            if (data?.success) {
                setPaymentData(data);
                setShowPaymentInstructions(true);
                toast({ title: "Invoice berhasil dibuat!" });
            } else {
                throw new Error(data?.error || "Gagal membuat pembayaran");
            }
        } catch (error: any) {
            console.error("[Payment] Error:", error);
            toast({
                title: "Error",
                description: error.message || "Gagal memproses pembayaran.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (showPaymentInstructions) {
        return (
            <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
                <Card className="w-full max-w-2xl border-2 border-primary/20 shadow-2xl">
                    <CardHeader className="text-center border-b bg-muted/30">
                        <div className="flex justify-center mb-2">
                            <div className="bg-success/10 text-success px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                                <div className="h-2 w-2 rounded-full bg-success"></div>
                                MENUNGGU PEMBAYARAN
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold font-display">Instruksi Pembayaran</CardTitle>
                        <p className="text-sm text-muted-foreground font-mono">Ref: {paymentData?.tripay_reference}</p>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-8">
                        {paymentData?.payCode && paymentData?.paymentMethod !== 'QRIS' && (
                            <div className="bg-card border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center bg-gradient-to-b from-primary/5 to-transparent">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2 font-display">Nomor Virtual Account</p>
                                <div className="text-4xl md:text-5xl font-mono font-black text-foreground mb-6 tracking-tighter tabular-nums select-all">
                                    {paymentData.payCode}
                                </div>
                                <Button variant="secondary" size="lg" className="rounded-full px-8 font-bold gap-2 shadow-lg hover:shadow-primary/20 transition-all" onClick={() => {
                                    navigator.clipboard.writeText(paymentData.payCode);
                                    toast({ title: "Nomor VA Disalin!" });
                                }}>
                                    <Copy className="w-4 h-4" /> SALIN KODE
                                </Button>
                                <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> Transfer ke bank {selectedPaymentMethod}
                                </p>
                            </div>
                        )}

                        {paymentData?.qrUrl && (
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-white rounded-2xl shadow-xl mb-6 ring-1 ring-black/5">
                                    <img src={paymentData.qrUrl} alt="QRIS" className="w-64 h-64 mx-auto" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="font-bold text-lg font-display">Scan QRIS untuk Bayar</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                        Screenshot kode QR di atas dan bayar menggunakan aplikasi Bank atau E-Wallet (Gopay, Ovo, Dana, dll).
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/50 p-4 rounded-xl border border-border">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Tagihan</p>
                                <p className="text-2xl font-black text-foreground font-display">{formatCurrency(paymentData?.amount)}</p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-xl border border-border">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Metode</p>
                                <p className="text-lg font-black text-foreground font-display">{selectedPaymentMethod}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10 text-sm text-primary">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <p className="font-medium">Sistem sedang mendeteksi pembayaran Anda secara otomatis...</p>
                            </div>
                            <Button onClick={() => navigate('/dashboard')} variant="ghost" className="w-full text-muted-foreground">
                                Kembali ke Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                <header className="flex flex-col gap-2">
                    <Button variant="ghost" className="w-fit -ml-2 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                    </Button>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-12 w-12 md:h-16 md:w-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg transform -rotate-3">
                            <Crown className="h-6 w-6 md:h-9 md:w-9 text-white drop-shadow-md" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-4xl font-extrabold font-display tracking-tight text-foreground">Upgrade PRO</h1>
                            <p className="text-xs md:text-sm text-muted-foreground font-medium">Lepaskan potensi penuh bisnis Anda dengan Autochat PRO.</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Form Section */}
                    <div className="lg:col-span-7 space-y-8">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                                <div className="h-1 w-8 bg-primary rounded-full"></div>
                                Langkah 1: Informasi Profil
                            </div>
                            <Card className="border-border shadow-md">
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Nama Lengkap</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-10 h-11 bg-muted/30 focus-visible:ring-primary" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Contoh: Budi Santoso" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Nomor WhatsApp</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-10 h-11 bg-muted/30 focus-visible:ring-primary" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="08123456789" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Alamat Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input className="pl-10 h-11 bg-muted/30 disabled:opacity-80" type="email" value={email} disabled placeholder="email@contoh.com" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                                <div className="h-1 w-8 bg-primary rounded-full"></div>
                                Langkah 2: Pilih Metode Pembayaran
                            </div>
                            <Card className="border-border shadow-md">
                                <CardContent className="p-6">
                                    <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {paymentMethods.map(method => (
                                            <Label key={method.code} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-muted/50 ${selectedPaymentMethod === method.code ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-border'}`}>
                                                <RadioGroupItem value={method.code} className="h-5 w-5" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-black text-foreground truncate">{method.name}</div>
                                                    <div className="text-[10px] text-muted-foreground leading-tight uppercase font-bold tracking-tight truncate">{method.description}</div>
                                                </div>
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    {/* Checkout / Summary Section */}
                    <div className="lg:col-span-5 lg:sticky lg:top-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                                <div className="h-1 w-8 bg-primary rounded-full"></div>
                                Summary Pesanan
                            </div>

                            <Card className="border-primary/20 shadow-xl overflow-hidden bg-gradient-to-b from-card to-muted/20">
                                <CardHeader className="bg-primary/5 border-b border-primary/10">
                                    <CardTitle className="text-sm font-bold uppercase text-primary tracking-widest">Detail Membership</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="p-4 space-y-4">
                                        {subscriptionPlans.map(plan => (
                                            <Label key={plan.id} className={`block cursor-pointer relative transition-all ${selectedPlan === plan.id ? 'scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}>
                                                <RadioGroupItem value={plan.id} className="sr-only" />
                                                <div className={`p-5 rounded-2xl border-2 transition-all ${selectedPlan === plan.id ? 'border-primary bg-background shadow-lg' : 'border-border bg-muted/20'}`}>
                                                    {selectedPlan === plan.id && (
                                                        <div className="absolute -top-3 -right-3 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-4 border-background">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <p className="font-black text-lg text-foreground font-display">{plan.name}</p>
                                                            <p className="text-xs font-medium text-muted-foreground">{plan.duration}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black text-primary font-display tabular-nums">
                                                                {formatCurrency(plan.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {[
                                                            "Unlimited Autochat Triggers",
                                                            "Prioritas Webhook Processing",
                                                            "Analytics Lanjutan",
                                                            "Instagram & FB Connection"
                                                        ].map((feature, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground/80">
                                                                <div className="h-1 w-1 bg-primary rounded-full"></div>
                                                                {feature}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Label>
                                        ))}
                                    </RadioGroup>

                                    <div className="p-6 bg-muted/30 border-t space-y-4">
                                        <div className="flex justify-between items-center text-sm font-bold uppercase text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span className="text-foreground tabular-nums">{formatCurrency(subscriptionPlans.find(p => p.id === selectedPlan)?.price || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold uppercase text-muted-foreground">
                                            <span>Biaya Admin</span>
                                            <span className="text-success tracking-tighter tabular-nums">GRATIS</span>
                                        </div>
                                        <div className="pt-4 border-t border-border flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total Pembayaran</p>
                                                <p className="text-4xl font-black text-foreground font-display tracking-tighter tabular-nums leading-none">
                                                    {formatCurrency(subscriptionPlans.find(p => p.id === selectedPlan)?.price || 0)}
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleCreatePayment}
                                            disabled={loading}
                                            className="w-full h-16 text-xl font-black uppercase tracking-widest shadow-[0_8px_32px_-8px_rgba(var(--primary-rgb),0.5)] transition-all hover:scale-[1.01] active:scale-[0.98] rounded-2xl"
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                    MEMPROSES...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    BAYAR SEKARANG
                                                    <ArrowLeft className="h-5 w-5 transform rotate-180" />
                                                </div>
                                            )}
                                        </Button>
                                        <p className="text-center text-[10px] text-muted-foreground font-bold uppercase flex items-center justify-center gap-1.5 pt-2">
                                            <Lock className="h-3 w-3" /> Transaksi Aman & Terenkripsi
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
