import { useState } from 'react';
<<<<<<< HEAD
import { Mail, Phone, MapPin, Send, Target, Eye, Users } from 'lucide-react';
=======
import { Send, Target, Eye, Users } from 'lucide-react';
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
<<<<<<< HEAD
import { toast } from 'sonner@2.0.3';
=======
import { toast } from 'sonner';
import { TEAM_MEMBERS } from '../data/constants';
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50

export function AboutContact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
<<<<<<< HEAD
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Submits to Netlify Forms. The previous version showed a success toast
  // without sending anything anywhere — the message was silently discarded.
  // Netlify picks this up via the hidden static form in index.html; the
  // form-name field below must match its name attribute.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          ...formData,
        }).toString(),
      });

      if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);

      setStatus('sent');
      toast.success('Message sent. We\'ll get back to you by email.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact form submission failed:', err);
      setStatus('error');
      toast.error('Could not send your message.');
    }
  };

  return (
    <section className="px-5 py-20 sm:px-8 md:py-24">
      <div className="max-w-6xl mx-auto">
        {/* About Section */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="t-h2 text-ink mb-4">About MoneyGroww</h2>
            <p className="t-body">
=======

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };


  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* About Section */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">About MoneyGroww</h2>
            <p className="text-lg text-muted-foreground">
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
              Empowering individuals to make informed financial decisions through smart tools and insights.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Mission */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
<<<<<<< HEAD
                <Target className="h-12 w-12 text-accent mx-auto mb-4" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-3">
=======
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                  To democratize financial planning by providing accessible, user-friendly tools that help
                  everyone achieve their financial goals, regardless of their background or experience.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
<<<<<<< HEAD
                <Eye className="h-12 w-12 text-pos mx-auto mb-4" />
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-3">
=======
                <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                  To become the most trusted platform for personal financial growth, enabling millions
                  to build wealth systematically and achieve financial independence.
                </p>
              </CardContent>
            </Card>

            {/* Values */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
<<<<<<< HEAD
                <Users className="h-12 w-12 text-ink-2 mx-auto mb-4" />
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-3">
=======
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                  Transparency, simplicity, and user-centricity drive everything we do. We believe
                  in making complex financial concepts simple and actionable for everyone.
                </p>
              </CardContent>
            </Card>
          </div>

<<<<<<< HEAD
          {/* NOTE: this block previously listed three invented team members
              ("Rahul Sharma — Financial Advisor, 10+ years experience" etc.)
              as if they were real staff with real financial credentials.
              Fabricated people are removed. Add your actual team here when
              there is one; until then, how the numbers are produced is the
              more useful and more honest thing to show. */}
          <div className="mb-12">
            <h3 className="t-h3 text-ink mb-5">How the numbers are produced</h3>
            <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
              {[
                {
                  title: 'Standard formulas',
                  body: 'SIP uses the annuity-due future-value formula; lumpsum uses annual compounding; EMI uses the standard reducing-balance formula.',
                },
                {
                  title: 'Covered by tests',
                  body: 'The calculation layer is unit-tested, including zero-rate and boundary cases, so a refactor cannot silently change a result.',
                },
                {
                  title: 'Market data, attributed',
                  body: 'Prices and headlines come from public Yahoo Finance endpoints, fetched server-side and refreshed continuously.',
                },
              ].map((item) => (
                <div key={item.title} className="bg-surface p-6">
                  <h4 className="text-sm font-medium text-ink">{item.title}</h4>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-3">
                    {item.body}
                  </p>
                </div>
=======
          {/* Team Section */}
          <div className="mb-12">
            <h3 className="text-2xl text-center mb-8">Meet Our Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TEAM_MEMBERS.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
              ))}
            </div>
          </div>

<<<<<<< HEAD
          {/* What the tool actually does. The previous version of this block
              showed invented traction figures ("100K+ Happy Users", "98% User
              Satisfaction") presented as fact — replaced with claims that are
              true of the product as built. */}
          <div className="rounded-lg border border-line bg-surface-2 p-8">
            <h3 className="t-h3 text-ink">What you get</h3>
            <ul className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {[
                {
                  title: 'Standard formulas, shown in full',
                  body: 'SIP, lumpsum and EMI calculations use the standard financial formulas, with the invested-vs-returns split always visible.',
                },
                {
                  title: 'Live Indian market data',
                  body: 'Index, ETF and large-cap prices refresh continuously while you plan.',
                },
                {
                  title: 'No account required',
                  body: 'Every calculator works immediately, with nothing to sign up for.',
                },
                {
                  title: 'Assumptions stated, not hidden',
                  body: 'Each projection names the return rate it assumes and what it cannot promise.',
                },
              ].map((item) => (
                <li key={item.title}>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-3">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
=======

>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
        </div>

        {/* Contact Section */}
        <div className="mt-20">
<<<<<<< HEAD
          <div className="max-w-2xl mb-12">
            <h2 className="t-h2 text-ink mb-4">Get in Touch</h2>
            <p className="t-body">
=======
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Get in Touch</h2>
            <p className="text-lg text-muted-foreground">
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

<<<<<<< HEAD
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
=======
          <div className="max-w-2xl mx-auto">
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you soon</CardDescription>
              </CardHeader>
              <CardContent>
<<<<<<< HEAD
                <form
                  onSubmit={handleSubmit}
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  className="space-y-6"
                >
                  <input type="hidden" name="form-name" value="contact" />
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full name <span className="text-ink-3">(required)</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email address <span className="text-ink-3">(required)</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message <span className="text-ink-3">(required)</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
=======
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
<<<<<<< HEAD

                  <Button type="submit" className="w-full" disabled={status === 'sending'}>
                    <Send aria-hidden="true" className="h-4 w-4" />
                    {status === 'sending' ? 'Sending…' : 'Send message'}
                  </Button>

                  {/* Status is announced, and the failure case says what to do
                      instead rather than only that something went wrong. */}
                  <p aria-live="polite" className="text-[0.8125rem]">
                    {status === 'sent' && (
                      <span className="text-pos">
                        Sent — we'll reply to the address you gave.
                      </span>
                    )}
                    {status === 'error' && (
                      <span className="text-neg">
                        Couldn't send that. Email us directly at the address
                        listed opposite and we'll pick it up.
                      </span>
                    )}
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Reach out to us through any of these channels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-accent-soft p-3 rounded-full">
                      <Mail className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-ink-3">support@moneygroww.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-accent-soft p-3 rounded-full">
                      <Phone className="h-6 w-6 text-pos" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-ink-3">+91 98765 43210</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-secondary p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-ink-2" />
                    </div>
                    <div>
                      <p className="font-medium">Office</p>
                      <p className="text-ink-3">Mumbai, Maharashtra, India</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="text-ink-3">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="text-ink-3">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="text-ink-3">Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    {['LinkedIn', 'Twitter', 'Facebook', 'Instagram'].map((platform, index) => (
                      <Button key={index} variant="outline" size="sm" className="flex-1">
                        {platform}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
=======
                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
          </div>
        </div>
      </div>
    </section>
  );
}