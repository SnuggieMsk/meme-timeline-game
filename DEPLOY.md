# Deployment Instructions for Meme Timeline Game

Follow these steps to deploy your Meme Timeline Game to GitHub Pages:

1. **Update package.json**: Replace the "homepage" value in package.json with your GitHub username:
   ```json
   "homepage": "https://yourusername.github.io/meme-timeline-game",
   ```

2. **Create a GitHub repository**:
   - Go to GitHub and create a new repository named "meme-timeline-game"
   - Copy the repository URL for the next step

3. **Initialize Git and push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/meme-timeline-game.git
   git push -u origin main
   ```

4. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

5. **Access your app**:
   - Your app should now be available at: https://yourusername.github.io/meme-timeline-game

## Setting Up Your Firebase Database

1. In Firebase Console, create a collection called "memeVideos"
2. Set up Firebase security rules to allow reading by anyone and writing only by authenticated users

## Adding Content to Your Game

1. Find short YouTube clips of famous memes (5-10 seconds is ideal)
2. Upload them to YouTube as unlisted videos
3. Copy the video IDs and add them through the admin panel
4. Include accurate information about when the meme became popular and its country of origin

## Admin Login Instructions

1. Use the Firebase console to find your admin email
2. Use the password you set when creating the admin user
3. If you need to reset your admin password, use the Firebase console Authentication section
