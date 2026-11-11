# SignalForge
Open-Source AI Market Research &amp; Content Intelligence Agent- Turn social conversations into evidence-backed content opportunities.

## API Configuration

Notrix Growth Agent is an open-source research and content recommendation engine.

To collect live social media data, users must configure their own API credentials for the providers they choose to enable.

**API keys are not included in this repository.**

### Quick Start

1. Clone the repository.
2. Install the dependencies described in the setup guide.
3. Copy `.env.example` to `.env`.
4. Add your own API keys.
5. Configure your target industry, audience, geography, and research topics.
6. Run the environment validation command.
7. Start a research cycle.

### Environment Variables

Example configuration (illustrative; check `.env.example` for the exact variables supported by your version):

```dotenv
# Social data provider
SCRAPECREATORS_API_KEY=your_api_key_here

# Optional AI analysis provider
OPENAI_API_KEY=your_api_key_here
```

### Data Providers

- **Reddit:** Public research, discussions, and comments.
- **YouTube:** Videos, creator research, comments, and transcripts.
- **LinkedIn:** Professional conversations and market signals.
- **Facebook:** Public content and targeted source monitoring.
- **Other platforms:** Subject to available provider integrations.

Platform availability depends on configured credentials, provider access, and applicable restrictions.

Some integrations may require paid API credits. Users are responsible for their own provider accounts, costs, and compliance with applicable terms.

### Security

Never commit your `.env` file, API keys, access tokens, or private research data.

Use `.env.example` only for placeholder values.

Before publishing a repository, verify that secrets are absent from both the current files and Git history.

### Research Integrity

The agent separates observed evidence from interpretation and hypotheses.

Content recommendations should include supporting source links, confidence or evidence quality, and relevant limitations.

The agent does not guarantee that a recommendation will go viral or generate sales.
