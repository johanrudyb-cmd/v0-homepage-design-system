'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, Image as ImageIcon, Save, CheckCircle2, FileText, Download } from 'lucide-react';
import { SubscriptionWarning } from '@/components/subscription/SubscriptionWarning';

interface SettingsFormProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    plan: string;
    stripeCustomerId?: string | null;
  };
}

export function SettingsForm({ user: initialUser }: SettingsFormProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoadingInvoices(true);
      try {
        const res = await fetch('/api/stripe/invoices');
        const data = await res.json();
        if (data.invoices) {
          setInvoices(data.invoices);
        }
      } catch (err) {
        console.error('Erreur factures:', err);
      } finally {
        setLoadingInvoices(false);
      }
    };

    if (user.stripeCustomerId) {
      fetchInvoices();
    }
  }, [user.stripeCustomerId]);

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email,
    image: user.image || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/create-portal-session', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Impossible d\'ouvrir le portail de facturation');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validation
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      if (formData.newPassword && formData.newPassword.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères');
        setLoading(false);
        return;
      }

      const updateData: any = {
        name: formData.name,
        image: formData.image,
      };

      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la mise à jour');
        setLoading(false);
        return;
      }

      // Mettre à jour l'état utilisateur avec les nouvelles données
      setUser(data);

      // Mettre à jour les champs du formulaire avec les nouvelles valeurs
      setFormData((prev) => ({
        ...prev,
        name: data.name || '',
        email: data.email,
        image: data.image || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      setSuccess(true);

      // Rafraîchir la page pour mettre à jour les données côté serveur
      setTimeout(() => {
        router.refresh();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profil */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Nom complet
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Votre nom"
              className="border-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="votre@email.com"
              className="border-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Photo de profil (URL)
            </label>
            <Input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              className="border-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mot de passe */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Sécurité</CardTitle>
              <CardDescription>Changez votre mot de passe</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Mot de passe actuel
            </label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="Laissez vide pour ne pas changer"
              className="border-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Nouveau mot de passe
            </label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Minimum 8 caractères"
              className="border-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Répétez le mot de passe"
              className="border-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Abonnement</CardTitle>
              <CardDescription>Votre plan actuel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <SubscriptionWarning context="cancel" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg border border-border gap-4">
            <div>
              <p className="font-bold text-lg text-foreground">
                {user.plan === 'free' ? 'Plan Gratuit' : 'Plan Créateur'}
              </p>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {user.plan === 'free' ? 'Accès limité aux outils de base' : 'Accès intégral à l\'écosystème Créateur'}
                {user.plan === 'enterprise' && ' + Support dédié & sur-mesure'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/auth/choose-plan">
                <Button variant="outline" className="border-2">
                  Changer de plan
                </Button>
              </Link>
              {user.stripeCustomerId && (
                <Button
                  variant="outline"
                  className="border-2"
                  onClick={handlePortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? 'Ouverture...' : 'Gérer l\'abonnement et mes factures'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factures */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Historique de facturation</CardTitle>
              <CardDescription>Consultez et téléchargez vos factures Stripe</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingInvoices ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 font-semibold text-muted-foreground">Numéro</th>
                    <th className="py-3 font-semibold text-muted-foreground">Date</th>
                    <th className="py-3 font-semibold text-muted-foreground">Montant</th>
                    <th className="py-3 font-semibold text-muted-foreground">Statut</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-medium">{invoice.number}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(invoice.date * 1000).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 font-semibold">
                        {(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                          {invoice.status === 'paid' ? 'Payée' : invoice.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {invoice.pdf && (
                          <a
                            href={invoice.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Télécharger PDF"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-black/5 text-[#1D1D1F] hover:text-[#007AFF] transition-all"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune facture trouvée.</p>
              {!user.stripeCustomerId && (
                <p className="text-xs mt-1">Les factures apparaîtront après votre premier paiement.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-error/10 border-2 border-error/20 rounded-lg">
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-success/10 border-2 border-success/20 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <p className="text-sm text-success font-medium">Paramètres mis à jour avec succès !</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="shadow-modern-lg"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          <Save className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
