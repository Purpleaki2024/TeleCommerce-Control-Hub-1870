// Update menu handlers to support submenus
export const handleFloatingMenu = async (bot, msg, isAdmin = false) => {
  const chatId = msg.chat.id;
  const role = isAdmin ? 'admin' : 'customer';
  
  try {
    const menuItems = await menuService.getMenu(role);
    
    // Build keyboard structure
    const keyboard = {
      resize_keyboard: true,
      one_time_keyboard: false,
      keyboard: []
    };

    // Group items into rows of 2
    for (let i = 0; i < menuItems.length; i += 2) {
      const row = menuItems.slice(i, i + 2).map(item => ({
        text: item.text
      }));
      keyboard.keyboard.push(row);
    }

    await bot.sendMessage(
      chatId,
      isAdmin ? '👑 Admin Menu' : 'Main Menu',
      { reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Error sending menu:', error);
    await bot.sendMessage(
      chatId,
      'Failed to load menu. Please try again.'
    );
  }
};

export const handleSubMenu = async (bot, msg, parentCommand) => {
  const chatId = msg.chat.id;
  const isAdmin = config.adminIds.includes(chatId);
  
  try {
    const menuItems = await menuService.getMenu(isAdmin ? 'admin' : 'customer');
    const parentItem = menuItems.find(item => item.command === parentCommand);
    
    if (!parentItem?.submenu) {
      await bot.sendMessage(
        chatId,
        'No submenu available for this option'
      );
      return;
    }

    const keyboard = {
      resize_keyboard: true,
      one_time_keyboard: false,
      keyboard: []
    };

    // Add back button
    keyboard.keyboard.push([{ text: '⬅️ Back' }]);

    // Group submenu items into rows of 2
    for (let i = 0; i < parentItem.submenu.length; i += 2) {
      const row = parentItem.submenu.slice(i, i + 2).map(item => ({
        text: item.text
      }));
      keyboard.keyboard.push(row);
    }

    await bot.sendMessage(
      chatId,
      `${parentItem.text} Menu`,
      { reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Error sending submenu:', error);
    await bot.sendMessage(
      chatId,
      'Failed to load submenu. Please try again.'
    );
  }
};

// Update command setup to handle submenus
export const setupBotCommands = (bot) => {
  // ... existing command setup ...

  // Handle back button
  bot.on('message', async (msg) => {
    if (msg.text === '⬅️ Back') {
      await handleFloatingMenu(bot, msg, config.adminIds.includes(msg.chat.id));
      return;
    }
  });

  // Handle submenu items
  bot.on('message', async (msg) => {
    if (!msg.text || !msg.reply_markup) return;

    const text = msg.text;
    const chatId = msg.chat.id;
    const isAdmin = config.adminIds.includes(chatId);

    try {
      const menuItems = await menuService.getMenu(isAdmin ? 'admin' : 'customer');
      
      // Check if this is a submenu item
      for (const item of menuItems) {
        if (item.submenu) {
          const subItem = item.submenu.find(sub => sub.text === text);
          if (subItem) {
            // Handle submenu command
            await handleCommand(bot, msg, subItem.command);
            return;
          }
        }
      }

      // Handle main menu items
      // ... existing menu item handling ...
      
    } catch (error) {
      console.error('Menu command error:', error);
      await bot.sendMessage(
        chatId,
        'Failed to process your request. Please try again.'
      );
    }
  });
};