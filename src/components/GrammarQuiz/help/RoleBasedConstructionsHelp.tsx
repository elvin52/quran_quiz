import React from 'react';

export const RoleBasedConstructionsHelp: React.FC = () => {
  return (
    <div className="role-based-help">
      <h2>Role-Based Grammatical Constructions</h2>
      
      <div className="construction-section">
        <h3>🎯 Fiʿl–Fāʿil (فِعْل - فَاعِل)</h3>
        <p className="description">
          Identify the relationship between a <strong>verb (فِعْل)</strong> and its <strong>subject (فَاعِل)</strong>.
        </p>
        
        <div className="examples">
          <h4>Examples:</h4>
          <div className="example">
            <div className="arabic">نَعْبُدُ إِيَّاكَ</div>
            <div className="breakdown">
              • <span className="verb">نَعْبُدُ</span> = Fiʿl (verb: "we worship")
              <br />
              • <span className="subject">نحن</span> = Fāʿil (implied subject: "we")
            </div>
          </div>
        </div>
        
        <div className="how-to">
          <h4>How to identify:</h4>
          <ul>
            <li>Look for verbs (action words)</li>
            <li>Find who is performing the action</li>
            <li>Subject may be explicit or implied in verb conjugation</li>
          </ul>
        </div>
      </div>

      <div className="construction-section">
        <h3>📝 Harf Naṣb–Ismuha (حَرْف نَصْب - اسْمُهَا)</h3>
        <p className="description">
          Identify <strong>accusative particles</strong> and the <strong>nouns they affect</strong>.
        </p>
        
        <div className="examples">
          <h4>Common Particles:</h4>
          <div className="particles-grid">
            <div className="particle">
              <span className="arabic">إِنَّ</span>
              <span className="meaning">"Indeed"</span>
            </div>
            <div className="particle">
              <span className="arabic">أَنَّ</span>
              <span className="meaning">"That"</span>
            </div>
            <div className="particle">
              <span className="arabic">كَأَنَّ</span>
              <span className="meaning">"As if"</span>
            </div>
          </div>
          
          <div className="example">
            <div className="arabic">إِنَّ اللَّهَ غَفُورٌ</div>
            <div className="breakdown">
              • <span className="particle">إِنَّ</span> = Harf Naṣb (accusative particle)
              <br />
              • <span className="noun">اللَّهَ</span> = Ismuha (noun in accusative case)
            </div>
          </div>
        </div>
        
        <div className="how-to">
          <h4>How to identify:</h4>
          <ul>
            <li>Look for emphasis/assertion particles</li>
            <li>Find the noun immediately following</li>
            <li>Check for accusative case markers (fatḥah)</li>
          </ul>
        </div>
      </div>

      <div className="quiz-instructions">
        <h3>🎮 Quiz Instructions</h3>
        <ol>
          <li><strong>Read</strong> the verse carefully</li>
          <li><strong>Select</strong> the construction type from dropdown</li>
          <li><strong>Click</strong> on the first element (verb/particle)</li>
          <li><strong>Click</strong> on the related element (subject/noun)</li>
          <li><strong>Submit</strong> your answer for feedback</li>
        </ol>
        
        <div className="tips">
          <h4>💡 Tips for Success:</h4>
          <ul>
            <li>Start with easier verses to build confidence</li>
            <li>Pay attention to word endings (case markers)</li>
            <li>Consider context and meaning</li>
            <li>Use feedback to improve understanding</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .role-based-help {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        
        .construction-section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .description {
          font-size: 16px;
          margin-bottom: 15px;
        }
        
        .examples {
          margin: 15px 0;
        }
        
        .example {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin: 10px 0;
        }
        
        .arabic {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10px;
          direction: rtl;
        }
        
        .breakdown {
          font-size: 14px;
        }
        
        .verb {
          color: #e74c3c;
          font-weight: bold;
        }
        
        .subject {
          color: #3498db;
          font-weight: bold;
        }
        
        .particle {
          color: #9b59b6;
          font-weight: bold;
        }
        
        .noun {
          color: #27ae60;
          font-weight: bold;
        }
        
        .particles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin: 10px 0;
        }
        
        .particle {
          text-align: center;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .particle .arabic {
          font-size: 18px;
          margin-bottom: 5px;
        }
        
        .particle .meaning {
          font-size: 12px;
          color: #666;
        }
        
        .how-to ul, .tips ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        
        .quiz-instructions {
          background: #e8f4f8;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
        }
        
        .quiz-instructions ol {
          margin: 15px 0;
          padding-left: 20px;
        }
        
        .tips {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
};

export default RoleBasedConstructionsHelp;
